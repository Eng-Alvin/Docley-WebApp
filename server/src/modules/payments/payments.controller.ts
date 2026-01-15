import { Controller, Post, UseGuards, Req, InternalServerErrorException, Logger } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';

@Controller('api/payments')
@UseGuards(SubscriptionGuard)
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('create-session')
  async createCheckoutSession(
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;

    if (!userId) {
      this.logger.error('Unauthorized checkout attempt: Missing User ID in request');
      throw new InternalServerErrorException('Authentication Error: Missing User ID');
    }

    // Strict absolute production URLs for Whop v2
    const successUrl = 'https://docley-xi.vercel.app/dashboard?payment=success';
    const cancelUrl = 'https://docley-xi.vercel.app/dashboard?payment=cancel';

    this.logger.log(`Creating checkout session for User: ${userId}`);

    const result = await this.paymentsService.createCheckoutSession(userId, successUrl, cancelUrl);

    // Standardized return contract for frontend compliance
    return {
      redirectUrl: result.redirectUrl
    };
  }
}
