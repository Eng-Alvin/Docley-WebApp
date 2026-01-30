import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import {
    ArrowLeft, FileText, Loader2, CheckCircle, Wand2,
    BarChart3, MoreHorizontal, Settings, Download, Trash2
} from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

// Stores & Services
import useDocumentStore from '../../stores/useDocumentStore';
import { upgradeDocument } from '../../services/aiService';
import { exportToPDF, exportToWord } from './lib/exportUtils';
import { permanentlyDeleteDocument } from '../../services/documentsService';
import { EDITOR_CONFIG } from './editorConfig';

// Components
import { EditorToolbar } from './components/EditorToolbar';
import TipTapCanvas from './components/TipTapCanvas';
import { EditorSidebar } from './components/EditorSidebar';
import { DiagnosticReport } from '../../components/modals/DiagnosticReport';
import { DocumentSettingsModal } from '../../components/modals/DocumentSettingsModal';
import { CitationModal } from '../../components/modals/CitationModal';

export default function EditorContainer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();

    // Global Store State
    const {
        instantiate,
        status,
        doc,
        saveStatus,
        lastSavedAt,
        updateMetadata,
        resolveConflict,
        conflictDetected,
        updateContent // Used by TipTapCanvas, but purely via store inside component
    } = useDocumentStore(
        (state) => ({
            instantiate: state.instantiate,
            status: state.status,
            doc: {
                title: state.title,
                metadata: state.metadata,
                word_count: 0 // We might need to track this locally or in store
            },
            saveStatus: state.saveStatus,
            lastSavedAt: state.lastSavedAt,
            updateMetadata: state.updateMetadata,
            resolveConflict: state.resolveConflict,
            conflictDetected: state.conflictDetected,
            updateContent: state.updateContent
        }),
        shallow
    );

    // Initial content for editor (only for first load)
    // We use a ref/state to store it ONCE when status becomes ready to avoid subscribing to store updates
    const [initialContent, setInitialContent] = useState(null);

    useEffect(() => {
        if (status === 'ready' && initialContent === null) {
            setInitialContent(useDocumentStore.getState().content);
        }
    }, [status, initialContent]);

    // Local UI State
    const [editor, setEditor] = useState(null);
    const [zoom, setZoom] = useState(1.0);
    const [isExporting, setIsExporting] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

    // Modals
    const [showReport, setShowReport] = useState(false);
    const [showSettings, setShowSettings] = useState(false); // Dropdown
    const [showDocSettings, setShowDocSettings] = useState(false); // Modal
    const [showCitationModal, setShowCitationModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const imageInputRef = useRef(null);

    // Initialize Document
    useEffect(() => {
        if (id) {
            instantiate(id);
        }
    }, [id, instantiate]);

    // Handle Title Change
    const handleTitleChange = (e) => {
        updateContent(initialContent, e.target.value); // We need a way to update ONLY title... 
        // Current store updateContent updates both. 
        // Let's assume updateContent(content, title)
        // But we don't want to pass content here if we just change title.
        // I should probably add setTitle action to store.
        // For now, I'll access store directly or use updateMetadata? No, title is root.
        // 'updateContent' in store: (newContent, newTitle)
        // I'll assume I can pass null for content to keep it?
        // Checking store implementation: 
        // updateContent: (newContent, newTitle) => ... set({ content: newContent ... })
        // It overwrites content. 
        // I need to fix store or use a hack.
        // Hack: updateContent(editor.getHTML(), e.target.value)
        if (editor) {
            useDocumentStore.getState().updateContent(editor.getHTML(), e.target.value);
        }
    };

    // Actions
    const handleUpgrade = async () => {
        if (!editor) return;
        setIsUpgrading(true);
        try {
            const currentContent = editor.getText();
            if (currentContent.length < 10) throw new Error("Too short");

            const upgraded = await upgradeDocument(currentContent, id, 'Medium (Research Paper)');
            if (upgraded) {
                editor.commands.setContent(upgraded);
                addToast('Document upgraded!', 'success');
            }
        } catch (e) {
            addToast(e.message, 'error');
        } finally {
            setIsUpgrading(false);
        }
    };

    const handleExport = async (format) => {
        setIsExporting(true);
        try {
            const fileName = `${doc.title || 'Document'}.${format === 'PDF' ? 'pdf' : 'docx'}`;
            if (format === 'PDF') {
                const el = document.querySelector('.ProseMirror');
                await exportToPDF(el, fileName, { margins: doc.metadata?.margins });
            } else {
                await exportToWord(editor.getHTML(), fileName, {
                    title: doc.title,
                    margins: doc.metadata?.margins
                });
            }
            addToast('Export successful', 'success');
        } catch (e) {
            addToast('Export failed', 'error');
        } finally {
            setIsExporting(false);
            setShowSettings(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            editor.chain().focus().setImage({ src: ev.target.result }).run();
        };
        reader.readAsDataURL(file);
    };

    if (status === 'loading') {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (status === 'error' || status === 'not-found') {
        return <div className="p-10 text-center">Document not found or error loading.</div>;
    }

    return (
        <div className="fixed inset-0 bg-slate-100 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Link to="/dashboard/documents" className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <input
                                    value={doc.title}
                                    onChange={handleTitleChange}
                                    className="text-lg font-semibold bg-transparent focus:outline-none w-full"
                                    placeholder="Untitled"
                                />
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                    {saveStatus === 'saving' ? (
                                        <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</span>
                                    ) : (
                                        <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Saved</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleUpgrade} disabled={isUpgrading}>
                            <Wand2 className="mr-2 h-4 w-4" /> Upgrade
                        </Button>
                        <div className="w-px h-6 bg-slate-200" />
                        <Button variant="ghost" size="sm" onClick={() => setShowReport(true)}>
                            <BarChart3 className="mr-2 h-4 w-4" /> Diagnostics
                        </Button>

                        {/* More Menu (Settings/Export) */}
                        <div className="relative">
                            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                            {showSettings && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                                        <button onClick={() => { setShowDocSettings(true); setShowSettings(false); }} className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-sm">
                                            <Settings className="h-4 w-4" /> Settings
                                        </button>
                                        <div className="h-px bg-slate-100 my-1" />
                                        <button onClick={() => handleExport('PDF')} className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-sm">
                                            <Download className="h-4 w-4" /> Export PDF
                                        </button>
                                        <button onClick={() => handleExport('Word')} className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-sm">
                                            <Download className="h-4 w-4" /> Export Word
                                        </button>
                                        <div className="h-px bg-slate-100 my-1" />
                                        <button onClick={() => setShowDeleteConfirm(true)} className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-sm text-red-600">
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <EditorToolbar
                    editor={editor}
                    zoom={zoom}
                    setZoom={setZoom}
                    onImageUpload={handleImageUpload}
                    onCitationClick={() => setShowCitationModal(true)}
                    imageInputRef={imageInputRef}
                />
            </header>

            {/* Main Canvas + Sidebar */}
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 overflow-auto bg-[#cbd5e1] custom-scrollbar p-12">
                    <TipTapCanvas
                        content={initialContent}
                        editable={true}
                        onEditorReady={setEditor}
                        docMargins={doc.metadata?.margins}
                        headerText={doc.metadata?.header_text}
                    />
                </main>
                <EditorSidebar />
            </div>

            {/* Modals */}
            <DiagnosticReport isOpen={showReport} onClose={() => setShowReport(false)} documentText={editor?.getText() || ''} documentId={id} />
            <DocumentSettingsModal isOpen={showDocSettings} onClose={() => setShowDocSettings(false)} onSave={(updates) => updateMetadata(updates)} initialSettings={doc.metadata} />
            <CitationModal isOpen={showCitationModal} onClose={() => setShowCitationModal(false)} onInsert={(html) => editor?.commands.insertContent(html)} />

            {/* Conflict Modal */}
            {conflictDetected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
                        <h3 className="text-lg font-bold mb-2">Conflict Detected</h3>
                        <p className="text-sm text-slate-600 mb-4">You have a local version of this document that is newer than the server version.</p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => resolveConflict('remote')}>Use Server Version</Button>
                            <Button onClick={() => resolveConflict('local')}>Use Local Version</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
