import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class RetrievalService {
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
     * Retrieves the most relevant chunks for a given query and document.
     */
    async getRelevantChunks(
        documentId: string,
        query: string,
        limit: number = 5,
    ): Promise<string[]> {
        try {
            // 1. Generate embedding for the query
            const queryEmbedding = await this.generateEmbedding(query);
            if (!queryEmbedding) return [];

            // 2. Search using RPC
            const { data: chunks, error } = await this.client.rpc('match_document_chunks', {
                query_embedding: queryEmbedding,
                match_threshold: 0.3, // Minimum similarity
                match_count: limit,
                p_document_id: documentId,
            });

            if (error) {
                console.error('[Retrieval] RPC Error:', error);
                return [];
            }

            return chunks.map(c => c.content);
        } catch (error) {
            console.error('[Retrieval] Retrieval error:', error);
            return [];
        }
    }

    private async generateEmbedding(text: string): Promise<number[] | null> {
        if (!this.embeddingModel) return null;
        try {
            const result = await this.embeddingModel.embedContent(text);
            return result.embedding.values;
        } catch (err) {
            console.error('[Retrieval] Query embedding error:', err);
            return null;
        }
    }
}
