import { Injectable, InternalServerErrorException, UnauthorizedException, Logger } from '@nestjs/common';
import Whop from '@whop/sdk';

@Injectable()
export class PaymentsService {
    private readonly whop: Whop;
    private readonly logger = new Logger(PaymentsService.name);
    private readonly PLAN_ID = 'plan_EMmS2ygOVrIdN';

    // In-memory cache for subscription status
    private subscriptionCache = new Map<string, { isPremium: boolean, expiresAt: number }>();
    private readonly CACHE_TTL = 60 * 1000; // 60 seconds

    constructor() {
        const apiKey = process.env.WHOP_API_KEY || process.env.WHOP_PAYMENT_API_KEY;
        if (!apiKey) {
            throw new Error('CRITICAL CONFIG ERROR: WHOP_API_KEY or WHOP_PAYMENT_API_KEY is missing. Payments feature will not function. Please add it to your server .env file.');
        }
        this.whop = new Whop({ apiKey });
    }

    async checkSubscription(userId: string): Promise<boolean> {
        const now = Date.now();
        const cached = this.subscriptionCache.get(userId);

        if (cached && cached.expiresAt > now) {
            return cached.isPremium;
        }

        try {
            // Placeholder: In a real scenario, we'd check memberships via Whop SDK
            const isPremium = true;

            this.subscriptionCache.set(userId, {
                isPremium,
                expiresAt: now + this.CACHE_TTL
            });

            return isPremium;
        } catch (error) {
            this.logger.error(`Whop subscription check failed for ${userId}:`, error);
            return cached?.isPremium || false;
        }
    }

    /**
     * Creates a checkout session for the user and returns the sessionId.
     * This fulfills the 'Thin Client' requirement by keeping plan logic in the backend.
     */
    async getSessionId(userId: string): Promise<{ sessionId: string, url: string }> {
        if (!userId) {
            throw new UnauthorizedException('User not authenticated');
        }

        try {
            this.logger.debug(`Creating Whop checkout session for user ${userId}`);

            const { id } = await this.whop.checkoutConfigurations.create({
                plan_id: this.PLAN_ID,
                metadata: {
                    user_id: userId,
                },
                redirect_url: 'https://docley.vercel.app/settings/billing?status=success'
            });

            const checkoutUrl = `https://whop.com/checkout/${id}`;
            return {
                sessionId: id,
                url: checkoutUrl
            };
        } catch (error) {
            this.logger.error(`Failed to create Whop session for user ${userId}:`, error.message);
            throw new InternalServerErrorException('Could not generate checkout session');
        }
    }
}
