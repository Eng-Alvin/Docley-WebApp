import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
import { htmlToText } from 'html-to-text';

@Injectable()
export class IngestionService {
    private genAI: GoogleGenerativeAI;
    private embeddingModel: any;

    constructor(private readonly supabaseService: SupabaseService) {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.embeddingModel = this.genAI.getGenerativeModel({
                model: 'text-embedding-004',
            });
        }
    }

    private get client() {
        return this.supabaseService.getClient();
    }

    /**
     * Main entry point to process a document asynchronously.
     */
    async processDocument(documentId: string): Promise<void> {
        try {
            // 1. Mark document as processing
            await this.client
                .from('documents')
                .update({ status: 'processing' })
                .eq('id', documentId);

            // 2. Fetch the document details (including file_url or content)
            const { data: doc, error: fetchError } = await this.client
                .from('documents')
                .select('*')
                .eq('id', documentId)
                .single();

            if (fetchError || !doc) {
                console.error('[Ingestion] Document fetch error:', fetchError);
                return;
            }

            let text = '';

            // 3. Extract text based on source
            if (doc.file_url) {
                text = await this.extractTextFromStorage(doc.file_url);
            } else if (doc.content_html) {
                text = htmlToText(doc.content_html, { wordwrap: false });
            } else {
                text = doc.content || '';
            }

            if (!text || text.trim().length === 0) {
                console.warn('[Ingestion] No text found to ingest for document:', documentId);
                await this.client.from('documents').update({ status: 'draft' }).eq('id', documentId);
                return;
            }

            // 4. Chunk text (approx 500-1000 tokens)
            const chunks = this.chunkText(text, 1000);

            // 5. Generate embeddings and store in batches
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const embedding = await this.generateEmbedding(chunk);

                await this.client.from('document_chunks').insert({
                    document_id: documentId,
                    chunk_index: i,
                    content: chunk,
                    embedding: embedding,
                });
            }

            // 6. Update document status
            await this.client
                .from('documents')
                .update({
                    status: 'draft',
                    file_content: text.substring(0, 100000) // Store limited text preview in main table
                })
                .eq('id', documentId);

            console.log(`[Ingestion] Successfully processed document: ${documentId} (${chunks.length} chunks)`);
        } catch (error) {
            console.error('[Ingestion] Critical error during document processing:', error);
            await this.client.from('documents').update({ status: 'error' }).eq('id', documentId);
        }
    }

    private async extractTextFromStorage(fileUrl: string): Promise<string> {
        // Determine path from URL
        // fileUrl is likely something like "userId/documentId/filename"
        // We need to download it from storage first
        try {
            const { data, error } = await this.client.storage
                .from('documents')
                .download(fileUrl);

            if (error || !data) throw new Error(error?.message || 'Failed to download file');

            const buffer = Buffer.from(await data.arrayBuffer());

            if (fileUrl.endsWith('.pdf')) {
                const pdfData = await pdf(buffer);
                return pdfData.text;
            } else if (fileUrl.endsWith('.docx')) {
                const result = await mammoth.extractRawText({ buffer });
                return result.value;
            } else {
                return buffer.toString('utf-8');
            }
        } catch (err) {
            console.error('[Ingestion] Extraction error:', err);
            return '';
        }
    }

    private chunkText(text: string, maxChunkSize: number): string[] {
        const segments = text.split(/\n\s*\n/); // Split by paragraphs first
        const chunks: string[] = [];
        let currentChunk = '';

        for (const segment of segments) {
            if ((currentChunk + segment).length > maxChunkSize * 4) { // Rough char to token ratio
                if (currentChunk) chunks.push(currentChunk.trim());
                currentChunk = segment;
            } else {
                currentChunk += (currentChunk ? '\n\n' : '') + segment;
            }
        }

        if (currentChunk) chunks.push(currentChunk.trim());
        return chunks;
    }

    /**
     * Extracts high-fidelity HTML content from a file buffer.
     * DOCX: Uses mammoth with style mapping.
     * PDF: Uses pdf-parse with paragraph preservation.
     */
    async extractContentHtml(buffer: Buffer, mimetype: string): Promise<string> {
        try {
            if (mimetype.includes('pdf') || mimetype === 'application/pdf') {
                const pdfData = await pdf(buffer);
                const text = pdfData.text;
                // Heuristic: Double newlines are paragraphs.
                return text
                    .split(/\n\s*\n/)
                    .map(para => `<p>${para.trim()}</p>`)
                    .join('');
            } else if (
                mimetype.includes('wordprocessingml') ||
                mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ) {
                const options = {
                    styleMap: [
                        "b => strong",
                        "i => em",
                        "u => u",
                        "strike => s",
                        "p[style-name='Heading 1'] => h1:fresh",
                        "p[style-name='Heading 2'] => h2:fresh",
                        "p[style-name='Heading 3'] => h3:fresh",
                        "p[style-name='Heading 4'] => h4:fresh",
                        "p[style-name='Heading 5'] => h5:fresh",
                        "p[style-name='Heading 6'] => h6:fresh",
                        "r[style-name='Strong'] => strong",
                    ]
                };
                const result = await mammoth.convertToHtml({ buffer }, options);
                return result.value;
            } else {
                // Fallback for text files
                return buffer.toString('utf-8')
                    .split(/\n\s*\n/)
                    .map(para => `<p>${para.trim()}</p>`)
                    .join('');
            }
        } catch (error) {
            console.error('[Ingestion] HTML extraction error:', error);
            return ''; // Fail gracefully, user will get empty doc or we can throw
        }
    }

    private async generateEmbedding(text: string): Promise<number[] | null> {
        if (!this.embeddingModel) return null;
        try {
            const result = await this.embeddingModel.embedContent(text);
            return result.embedding.values;
        } catch (err) {
            console.error('[Ingestion] Embedding generation error:', err);
            return null;
        }
    }
}
