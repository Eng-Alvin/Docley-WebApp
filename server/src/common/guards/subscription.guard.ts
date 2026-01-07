import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../../supabase/supabase.service';
import { PaymentsService } from '../../payments/payments.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_PREMIUM_KEY } from '../decorators/require-premium.decorator';

@Injectable()
export class SubscriptionGuard implements CanActivate {
    private readonly logger = new Logger(SubscriptionGuard.name);

    constructor(
        private reflector: Reflector,
        private supabaseService: SupabaseService,
        private paymentsService: PaymentsService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if route is marked as Public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Missing authorization header');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Missing token');
        }

        // 1. Verify Supabase JWT
        const { data: { user }, error } = await this.supabaseService.getClient().auth.getUser(token);

        if (error || !user) {
            this.logger.error('Supabase Auth verification failed:', error?.message);
            throw new UnauthorizedException('Invalid or expired token');
        }

        // Attach user to request
        request.user = user;

        // 2. Check if route requires Premium
        const requirePremium = this.reflector.getAllAndOverride<boolean>(IS_PREMIUM_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requirePremium) {
            return true;
        }

        // 3. Verify Whop Subscription (High-Performance Caching inside WhopService)
        const isPremium = await this.paymentsService.checkSubscription(user.id);

        if (!isPremium) {
            this.logger.warn(`User ${user.id} denied access to premium route`);
            throw new ForbiddenException('Premium subscription required');
        }

        return true;
    }
}
