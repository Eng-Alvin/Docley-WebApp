import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DocumentsService {
    constructor(private readonly supabaseService: SupabaseService) { }

    private get client() {
        return this.supabaseService.getClient();
    }

    async create(userId: string, data: any) {
        const { data: document, error } = await this.client
            .from('documents')
            .insert({
                user_id: userId,
                title: data.title,
                content: data.content || '',
                content_html: data.content_html || '',
                academic_level: data.academic_level || 'undergraduate',
                citation_style: data.citation_style || 'APA 7th Edition',
                document_type: data.document_type || 'Essay',
                file_name: data.file_name || null,
                file_size: data.file_size || null,
                file_url: data.file_url || null,
                margins: data.margins || { top: 96, bottom: 96, left: 96, right: 96 },
                header_text: data.header_text || '',
                status: data.status || 'draft',
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return document;
    }

    async findAll(userId: string, filters?: { status?: string; academic_level?: string; type?: 'owned' | 'shared' | 'all' }) {
        // Query documents owned by user OR shared with user
        let query = this.client
            .from('documents')
            .select(`
                *,
                document_shares!left(user_id, permission)
            `)
            .is('deleted_at', null);

        if (filters?.type === 'shared') {
            query = query.eq('document_shares.user_id', userId);
        } else if (filters?.type === 'owned') {
            query = query.eq('user_id', userId);
        } else {
            // Default: All (Owned OR Shared)
            query = query.or(`user_id.eq.${userId},document_shares.user_id.eq.${userId}`);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.academic_level) {
            query = query.eq('academic_level', filters.academic_level);
        }

        const { data, error } = await query.order('updated_at', { ascending: false });

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return data;
    }

    async findOne(id: string, userId: string) {
        const { data, error } = await this.client
            .from('documents')
            .select(`
                *,
                document_shares!left(user_id, permission)
            `)
            .eq('id', id)
            .or(`user_id.eq.${userId},document_shares.user_id.eq.${userId}`)
            .is('deleted_at', null)
            .single();

        if (error) {
            throw new NotFoundException('Document not found');
        }

        // Calculate effective permission
        let permission = 'read';
        if (data.user_id === userId) {
            permission = 'owner';
        } else {
            const share = data.document_shares.find(s => s.user_id === userId);
            permission = share?.permission || 'read';
        }

        return { ...data, permission };
    }

    async update(id: string, updates: any, userId: string) {
        const { data, error } = await this.client
            .from('documents')
            .update(updates)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return data;
    }

    async remove(id: string, userId: string) {
        const { data, error } = await this.client
            .from('documents')
            .delete()
            .eq('id', id)
            .eq('user_id', userId) // Only owner can delete
            .select()
            .single();

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return data;
    }

    async shareDocument(documentId: string, ownerId: string, shareWithEmail: string, permission: 'read' | 'write') {
        // 1. Find user by email (using rpc or direct user query if we have access, 
        // but Supabase usually hides user emails from public. 
        // We'll assume a helper RPC "get_user_id_by_email" exists or use a lookup table)

        // For now, we'll try to find the user in our local "profiles" or "users" table if it exists
        const { data: userData, error: userError } = await this.client
            .from('users') // Assuming a public users/profiles table synced with auth.users
            .select('id')
            .eq('email', shareWithEmail)
            .single();

        if (userError || !userData) {
            throw new NotFoundException('User not found with this email');
        }

        const { data, error } = await this.client
            .from('document_shares')
            .upsert({
                document_id: documentId,
                user_id: userData.id,
                permission: permission,
                shared_by: ownerId
            })
            .select()
            .single();

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return data;
    }

    async getShares(documentId: string, userId: string) {
        const { data, error } = await this.client
            .from('document_shares')
            .select(`
                *,
                users!inner(email)
            `)
            .eq('document_id', documentId);

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return data;
    }
}
