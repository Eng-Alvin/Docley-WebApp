import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
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

    // Admin exemption: unlimited usage
    if (usage?.role === 'admin') {
      return true;
    }

    const path: string = request.route?.path || request.path || '';

    // EMAIL VERIFICATION CHECK (New Requirement)
    // Restrict premium actions for unverified users
    const isEmailVerified = user.email_confirmed_at != null;
    const isPremiumAction =
      (path === '/ai/transform' && (request.body?.mode === 'upgrade' || request.body?.mode === 'transform')) ||
      (path.includes('/export')); // Assuming export paths contain '/export'

    if (!isEmailVerified && isPremiumAction) {
      throw new HttpException({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Email Not Verified',
        message: 'Please verify your email to unlock exports and premium AI upgrades.',
        notification: {
          code: 'VERIFICATION_REQUIRED',
          message: 'Please verify your email to unlock all features.',
          priority: 'high',
          action: {
            label: 'Resend Verification',
            type: 'navigate',
            payload: { path: '/dashboard/settings' }
          }
        }
      }, HttpStatus.FORBIDDEN);
    }

    // Paid users bypass limits (prefer users.is_premium; fallback to legacy usage.subscription_tier)
    if (usage?.is_premium === true || usage?.subscription_tier === 'pro') {
      return true;
    }

    try {
      // Documents create: consume a document slot
      if (path === '/documents' && request.method === 'POST') {
        await this.usersService.consumeDocument(user.id);
        return true;
      }

      // AI endpoint: decide based on mode
      if (path === '/ai/transform' && request.method === 'POST') {
        const mode = request.body?.mode;
        if (mode === 'diagnostic' || mode === 'analysis') {
          await this.usersService.consumeAiDiagnostic(user.id);
        } else if (mode === 'upgrade' || mode === 'transform') {
          await this.usersService.consumeAiUpgrade(user.id);
        }
        return true;
      }
    } catch (e: any) {
      const message = e?.message || '';
      if (message.toLowerCase().includes('limit')) {
        const response = {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          error: 'Limit Reached',
          message:
            'You have reached your free lifetime limit. Please upgrade to Pro for unlimited access.',
          notification: {
            code: 'LIMIT_REACHED',
            message: 'You have reached your free lifetime limit.',
            priority: 'critical',
            action: {
              label: 'Upgrade to Pro',
              type: 'upgrade',
            },
            ttl: null,
          },
        };
        throw new HttpException(response, HttpStatus.PAYMENT_REQUIRED);
      }
      throw e;
    }

    return true;
  }
}
