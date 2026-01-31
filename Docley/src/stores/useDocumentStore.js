import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import apiClient from '../api/client';

// Debounce helper
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
};

const useDocumentStore = create((set, get) => {
    // Internal Debounced Save - Initialized within the creator closure
    const debouncedSave = debounce(() => {
        get().saveToSupabase();
    }, 5000);

    return {
        // State
        id: null,
        title: '',
        content: '', // HTML content for editor initialization
        metadata: {},
        status: 'loading', // loading | ready | error | not-found
        saveStatus: 'saved', // saved | saving | unsaved
        isDirty: false,
        isProcessing: false, // AI processing state
        error: null,
        lastSavedAt: null, // Timestamp of last successful remote save
        conflictDetected: null, // { local, remote }
        isProcessingAI: false,

        // Actions
        setId: (id) => set({ id }),

        // Initialize Document (Load from Supabase + LocalStorage Check)
        instantiate: async (documentId) => {
            set({ status: 'loading', id: documentId, error: null });

            try {
                // 1. Fetch Remote Document
                const { data: remoteDoc, error: remoteError } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('id', documentId)
                    .single();

                if (remoteError) {
                    if (remoteError.code === 'PGRST116') {
                        set({ status: 'not-found' });
                        return;
                    }
                    // Handle RLS/Auth errors
                    if (remoteError.status === 401 || remoteError.status === 403) {
                        window.location.href = `/auth?redirect=/editor/${documentId}`;
                        return;
                    }
                    throw remoteError;
                }

                // 2. Check Local Draft
                const localKey = `doc_draft_${documentId}`;
                const localDraft = localStorage.getItem(localKey);
                let isLocalNewer = false;
                let parsedDraft = null;

                if (localDraft) {
                    try {
                        parsedDraft = JSON.parse(localDraft);

                        // FIX: Ignore conflict if content is practically identical
                        // (Normalization might be needed, but strict string check is a good first step)
                        // Also check if remote content is null to avoid crash
                        const remoteContent = remoteDoc.content || '';

                        if (parsedDraft.content !== remoteContent) {
                            const localTime = new Date(parsedDraft.updated_at).getTime();
                            const remoteTime = new Date(remoteDoc.updated_at).getTime();

                            // FIX: Increased grace period to 7 seconds
                            if (localTime > remoteTime + 7000) {
                                isLocalNewer = true;
                            }
                        }
                    } catch (e) {
                        console.error('Failed to parse local draft', e);
                        localStorage.removeItem(localKey);
                    }
                }

                // If conflict, set conflict state
                if (isLocalNewer && parsedDraft) {
                    set({
                        conflictDetected: { local: parsedDraft, remote: remoteDoc },
                        status: 'ready' // Allow UI to render conflict modal
                    });
                    // Don't overwrite content yet
                } else {
                    // No conflict (or ignored), safe to load remote
                    set({
                        title: remoteDoc.title,
                        content: remoteDoc.content || '',
                        metadata: {
                            academic_level: remoteDoc.academic_level,
                            citation_style: remoteDoc.citation_style,
                            document_type: remoteDoc.document_type
                        },
                        status: 'ready',
                        lastSavedAt: remoteDoc.updated_at,
                        conflictDetected: null
                    });
                }

            } catch (err) {
                console.error('Failed to load document:', err);
                set({ status: 'error', error: err.message });
            }
        },

        // Resolving Conflict (UI calls this)
        resolveConflict: (choice) => {
            const { conflictDetected, id, saveToSupabase } = get();
            if (!conflictDetected) return;

            if (choice === 'local') {
                set({
                    title: conflictDetected.local.title || conflictDetected.remote.title,
                    content: conflictDetected.local.content,
                    status: 'ready',
                    isDirty: true, // Mark dirty so it saves to remote immediately
                    conflictDetected: null
                });
                // Trigger immediate save to sync local to remote
                saveToSupabase();
            } else {
                set({
                    title: conflictDetected.remote.title,
                    content: conflictDetected.remote.content,
                    status: 'ready',
                    conflictDetected: null,
                    isDirty: false
                });
                // Clear local draft to prevent re-trigger
                localStorage.removeItem(`doc_draft_${id}`);
            }
        },

        // Set Title (Independent of content)
        setTitle: (newTitle) => {
            const { id, content } = get();

            set({ title: newTitle, isDirty: true, saveStatus: 'unsaved' });

            // Update local draft
            const draft = {
                id,
                content,
                title: newTitle,
                updated_at: new Date().toISOString()
            };
            localStorage.setItem(`doc_draft_${id}`, JSON.stringify(draft));

            debouncedSave();
        },

        // Update Content (Called by Editor onUpdate)
        updateContent: (newContent, newTitle = null) => {
            const { id, title } = get();

            // 1. Update Store State
            set((state) => ({
                content: newContent,
                title: newTitle || state.title,
                isDirty: true,
                saveStatus: 'unsaved'
            }));

            // 2. Update Local Storage (Immediate / Throttled)
            const draft = {
                id,
                content: newContent,
                title: newTitle || title,
                updated_at: new Date().toISOString()
            };
            localStorage.setItem(`doc_draft_${id}`, JSON.stringify(draft));

            // 3. Trigger Debounced Remote Save
            debouncedSave();
        },

        // Save to Remote
        saveToSupabase: async () => {
            const { id, title, content, isDirty } = get();
            if (!id || !isDirty) return;

            set({ saveStatus: 'saving' });

            try {
                const { error } = await supabase
                    .from('documents')
                    .update({
                        title,
                        content,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id);

                if (error) throw error;

                set({ saveStatus: 'saved', isDirty: false, lastSavedAt: new Date().toISOString() });

                // Update local draft to avoid future conflicts?
                // Yes, update timestamp.
                const draft = {
                    id,
                    content,
                    title,
                    updated_at: new Date().toISOString()
                };
                localStorage.setItem(`doc_draft_${id}`, JSON.stringify(draft));

            } catch (err) {
                console.error('Auto-save failed:', err);
                set({ saveStatus: 'unsaved', error: 'Auto-save failed' });

                // Global RLS Error Handler
                if (err.status === 401 || err.status === 403) {
                    window.location.href = `/auth?redirect=/editor/${id}`;
                }
            }
        },

        // Expose debouncedSave if needed externally (rare, but possibly for forceful flush on unmount)
        debouncedSave: debouncedSave,

        // AI Processing Actions
        setProcessing: (isProcessing) => set({ isProcessing }),

        // Metadata Updates
        updateMetadata: async (updates) => {
            const { id, metadata } = get();
            // Optimistic update
            set({ metadata: { ...metadata, ...updates } });

            // Fire and forget update
            await supabase.from('documents').update(updates).eq('id', id);
        },

        // Academic Polish Action
        polishSelection: async (editor) => {
            const { selection } = editor.state;
            const { from, to } = selection;
            const text = editor.state.doc.textBetween(from, to, ' ');

            if (!text || text.trim().length === 0) {
                // Return error to be handled by UI (toast)
                return { success: false, error: 'Please select some text to polish.' };
            }

            set({ isProcessingAI: true });

            try {
                const { metadata } = get();
                const response = await apiClient.post('/ai/polish', {
                    text,
                    academicLevel: metadata.academic_level || 'undergraduate',
                    citationStyle: metadata.citation_style || 'APA 7th Edition'
                });

                if (response.data && response.data.html) {
                    editor.commands.insertContent(response.data.html);
                    return { success: true };
                } else {
                    throw new Error('Invalid response from AI');
                }
            } catch (error) {
                console.error('Polish failed:', error);
                return { success: false, error: error.response?.data?.message || 'Failed to polish text. AI service might be busy.' };
            } finally {
                set({ isProcessingAI: false });
            }
        }
    };
});

export default useDocumentStore;
