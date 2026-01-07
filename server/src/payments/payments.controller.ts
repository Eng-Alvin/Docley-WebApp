import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SubscriptionGuard } from '../common/guards/subscription.guard';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get('session')
    @UseGuards(SubscriptionGuard)
    async getSession(@Req() req: any) {
        return this.paymentsService.getSessionId(req.user.id);
    }
}
