import { API_BASE_URL, getAuthHeaders } from '../api/client';

const API_URL = `${API_BASE_URL}/documents`;

/**
 * Documents Service
 * Handles all CRUD operations for documents via the NestJS Backend
 */

export async function uploadDocumentFile(file, documentId) {
    const headers = await getAuthHeaders();
    delete headers['Content-Type'];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentId', documentId);

    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload document');
    }

    const { filePath } = await response.json();
    return filePath;
}

export async function createDocument(documentData) {
    const headers = await getAuthHeaders();

    const payload = {
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
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create document');
    }

    return await response.json();
}

export async function getDocuments(filters = {}) {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.academicLevel) params.append('academic_level', filters.academicLevel);
    if (filters.type) params.append('type', filters.type);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_URL}${queryString}`, {
        method: 'GET',
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch documents');
    }

    return await response.json();
}

export async function getDocument(id) {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Document not found');
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch document');
    }

    return await response.json();
}

export async function updateDocument(id, updates) {
    const headers = await getAuthHeaders();

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

    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update document');
    }

    return await response.json();
}

export async function deleteDocument(id) {
    return updateDocument(id, { deleted_at: new Date().toISOString() });
}

export async function permanentlyDeleteDocument(id) {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to permanently delete document');
    }

    return true;
}

export async function autoSaveDocument(id, content, contentHtml) {
    return updateDocument(id, { content, contentHtml });
}

export async function getDocumentCount() {
    const docs = await getDocuments();
    return docs.length;
}
