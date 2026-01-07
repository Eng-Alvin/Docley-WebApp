import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SupabaseGuard } from '../supabase/supabase.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(SupabaseGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('create-session')
    async createSession(@Req() req: any) {
        const userId: string | undefined = req.user?.id;
        return this.paymentsService.createSession(userId);
    }
}
