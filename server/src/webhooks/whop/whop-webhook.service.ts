import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class WhopWebhookService {
    private readonly logger = new Logger(WhopWebhookService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    private get client() {
        return this.supabaseService.getClient();
    }

    async handleMembershipActivated(payload: any) {
        const email = payload.data?.email || payload.data?.user?.email;
        const whopUserId = payload.data?.user_id || payload.data?.user?.id;

        if (!email) {
            this.logger.error('No email found in Whop payload');
            return;
        }

        this.logger.log(`Activating premium for user: ${email} (Whop ID: ${whopUserId})`);

        const { error } = await this.client
            .from('users')
            .update({
                is_premium: true,
                whop_user_id: whopUserId,
                updated_at: new Date().toISOString()
            })
            .eq('email', email);

        if (error) {
            this.logger.error(`Failed to update user premium status: ${error.message}`);
            throw new InternalServerErrorException('Database update failed');
        }
    }

    async handlePaymentSucceeded(payload: any) {
        const userId = payload.data?.metadata?.user_id;
        const whopPaymentId = payload.data?.id;
        const amount = payload.data?.amount;
        const currency = payload.data?.currency;

        if (!userId) {
            this.logger.error('No user_id found in payment.succeeded metadata');
            return;
        }

        this.logger.log(`Payment succeeded for user_id: ${userId}, payment_id: ${whopPaymentId}, amount: ${amount} ${currency}`);

        // Update user to premium
        const { error: userError } = await this.client
            .from('users')
            .update({
                is_premium: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (userError) {
            this.logger.error(`Failed to update user premium status: ${userError.message}`);
            throw new InternalServerErrorException('Database update failed');
        }

        // Log transaction for audit
        const { error: logError } = await this.client
            .from('payment_transactions')
            .insert({
                user_id: userId,
                whop_payment_id: whopPaymentId,
                amount,
                currency,
                status: 'succeeded',
                raw_payload: payload,
                created_at: new Date().toISOString()
            });

        if (logError) {
            this.logger.error(`Failed to log payment transaction: ${logError.message}`);
            // Do not throw; user was already upgraded
        }
    }

    async handleMembershipDeactivated(payload: any) {
        const email = payload.data?.email || payload.data?.user?.email;

        if (!email) {
            this.logger.error('No email found in Whop payload');
            return;
        }

        this.logger.log(`Deactivating premium for user: ${email}`);

        const { error } = await this.client
            .from('users')
            .update({
                is_premium: false,
                updated_at: new Date().toISOString()
            })
            .eq('email', email);

        if (error) {
            this.logger.error(`Failed to update user premium status: ${error.message}`);
            throw new InternalServerErrorException('Database update failed');
        }
    }
}
