import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class UsageGuard implements CanActivate {
    constructor(private readonly usersService: UsersService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            return false;
        }

        const usage = await this.usersService.getOrCreateUsage(user.id);

        // If user is Pro, bypass all limits
        if (usage.subscription_tier === 'pro') {
            return true;
        }

        // Limit for Free users is 3 documents
        if (usage.document_count >= 3) {
            throw new ForbiddenException({
                error: 'Limit Reached',
                message: 'You have reached the free limit of 3 documents. Please upgrade to Pro for unlimited access.',
                limit: 3,
                current: usage.document_count,
            });
        }

        return true;
    }
}
