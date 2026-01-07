import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import Whop from '@whop/sdk';

@Injectable()
export class PaymentsService {
    private readonly whop: Whop;

    constructor() {
        const apiKey = process.env.WHOP_API_KEY || process.env.WHOP_PAYMENT_API_KEY;
        if (!apiKey) {
            throw new Error('WHOP_API_KEY or WHOP_PAYMENT_API_KEY is missing in server environment variables');
        }
        this.whop = new Whop({ apiKey });
    }

    async createSession(userId?: string) {
        if (!userId) {
            throw new UnauthorizedException('User not authenticated');
        }

        const planId = process.env.WHOP_PLAN_ID;
        if (!planId || planId === 'plan_placeholder') {
            throw new InternalServerErrorException('WHOP_PLAN_ID is missing or not set to a real plan ID in server environment variables');
        }

        const { id, purchase_url } = await this.whop.checkoutConfigurations.create({
            plan_id: planId,
            metadata: {
                user_id: userId,
            },
        });

        return {
            sessionId: id,
            purchase_url,
        };
    }
}
