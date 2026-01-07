import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePaymentSessionDto {
    @IsNotEmpty()
    @IsString()
    planId: string;
}

export class PaymentSessionResponseDto {
    @IsString()
    sessionId: string;

    @IsString()
    purchase_url: string;
}
