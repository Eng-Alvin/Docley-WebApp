import { supabase } from '../lib/supabase';
import apiClient from '../api/client';

/**
 * Documents Service
 * Handles CRUD operations via Supabase Client (Hybrid Model)
 * File Uploads/Ingestion and AI remain on Backend
 */

// Keep this on backend for text extraction/ingestion logic
export async function uploadDocumentFile(file, documentId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentId', documentId);

    const response = await apiClient.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data.filePath;
}

export async function createDocument(documentData) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const payload = {
        user_id: user.id, // Explicitly set owner for RLS
        title: documentData.title,
        content: documentData.content || '',
        content_html: documentData.contentHtml || '',
        academic_level: documentData.academicLevel || 'undergraduate',
        citation_style: documentData.citationStyle || 'APA 7th Edition',
        document_type: documentData.documentType || 'Essay',
        file_name: documentData.fileName || null,
        file_size: documentData.fileSize || null,
        file_url: documentData.fileUrl || null,
        status: 'draft',
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('documents')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getDocuments(filters = {}) {
    try {
        let query = supabase
            .from('documents')
            .select('*', { count: 'exact' })
            .is('deleted_at', null)
            .order('updated_at', { ascending: false });

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.academicLevel) query = query.eq('academic_level', filters.academicLevel);
        if (filters.type) query = query.eq('document_type', filters.type);

        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data,
            meta: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                hasMore: to < count - 1
            }
        };
    } catch (error) {
        console.error('Error fetching documents:', error);
        return { data: [], meta: { total: 0, page: 1, limit: 10, hasMore: false } };
    }
}

export async function getDocument(id) {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Error fetching document ${id}:`, error);
        return null;
    }
}

export async function getDocumentMetadata(id) {
    try {
        // In Supabase, this is same as getDocument unless we select specific fields
        const { data, error } = await supabase
            .from('documents')
            .select('id, title, status, updated_at, created_at, academic_level, citation_style, document_type, margins, header_text, word_count, permission') // Added permission if column exists
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Error fetching document metadata ${id}:`, error);
        throw error;
    }
}

export async function getDocumentContent(id) {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('id, content, content_html')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Error fetching document content ${id}:`, error);
        throw error;
    }
}

export async function updateDocument(id, updates) {
    // Map camelCase to snake_case for DB
    const updateData = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.contentHtml !== undefined) updateData.content_html = updates.contentHtml;
    if (updates.upgradedContent !== undefined) updateData.upgraded_content = updates.upgradedContent;
    if (updates.academicLevel !== undefined) updateData.academic_level = updates.academicLevel;
    if (updates.citationStyle !== undefined) updateData.citation_style = updates.citationStyle;
    if (updates.documentType !== undefined) updateData.document_type = updates.documentType;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.margins !== undefined) updateData.margins = updates.margins;
    if (updates.headerText !== undefined) updateData.header_text = updates.headerText;
    if (updates.fileUrl !== undefined) updateData.file_url = updates.fileUrl;
    if (updates.fileName !== undefined) updateData.file_name = updates.fileName;
    if (updates.fileSize !== undefined) updateData.file_size = updates.fileSize;
    if (updates.deleted_at !== undefined) updateData.deleted_at = updates.deleted_at;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteDocument(id) {
    return updateDocument(id, { deleted_at: new Date().toISOString() });
}

export async function permanentlyDeleteDocument(id) {
    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

export async function autoSaveDocument(id, content, contentHtml) {
    // Determine word count
    const wordCount = content ? content.trim().split(/\s+/).length : 0;

    // We update directly. Note: useDocumentStore also handles this, 
    // but this function might be used by the manual save button or legacy calls.
    const { data, error } = await supabase
        .from('documents')
        .update({
            content,
            content_html: contentHtml,
            word_count: wordCount,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getDocumentCount() {
    const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

    if (error) return 0;
    return count;
}
