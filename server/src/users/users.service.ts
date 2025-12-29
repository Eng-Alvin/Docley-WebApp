import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
    constructor(private readonly supabaseService: SupabaseService) { }

    private get client() {
        return this.supabaseService.getClient();
    }

    /**
     * Get or create usage record for a user
     */
    async getOrCreateUsage(userId: string) {
        const { data, error } = await this.client
            .from('usage')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            throw new InternalServerErrorException(`Failed to fetch usage: ${error.message}`);
        }

        if (data) {
            return await this.checkAndResetMonthly(data);
        }

        // Initialize usage record
        const { data: newUsage, error: createError } = await this.client
            .from('usage')
            .insert({
                user_id: userId,
                document_count: 0,
                last_reset_date: new Date().toISOString(),
                subscription_tier: 'free'
            })
            .select()
            .single();

        if (createError) {
            throw new InternalServerErrorException(`Failed to create usage record: ${createError.message}`);
        }

        return newUsage;
    }

    /**
     * Reset count if 30 days have passed
     */
    async checkAndResetMonthly(usage: any) {
        const lastReset = new Date(usage.last_reset_date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 30) {
            const { data: updatedUsage, error } = await this.client
                .from('usage')
                .update({
                    document_count: 0,
                    last_reset_date: now.toISOString(),
                    updated_at: now.toISOString()
                })
                .eq('user_id', usage.user_id)
                .select()
                .single();

            if (error) {
                console.error(`Failed to reset usage: ${error.message}`);
                return usage; // Fallback to current usage info
            }
            return updatedUsage;
        }

        return usage;
    }

    /**
     * Increment document count
     */
    async incrementUsage(userId: string) {
        // We use a RPC or a manual update. Since we just fetched, we can do update.
        const { data, error } = await this.client
            .from('usage')
            .select('document_count')
            .eq('user_id', userId)
            .single();

        if (error) return;

        await this.client
            .from('usage')
            .update({
                document_count: (data.document_count || 0) + 1,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
    }

    /**
     * Update user password using Supabase Admin Auth
     */
    async updatePassword(userId: string, newPassword: string) {
        const { data, error } = await this.client.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        );

        if (error) {
            throw new InternalServerErrorException(`Failed to update password: ${error.message}`);
        }

        return data;
    }
}
