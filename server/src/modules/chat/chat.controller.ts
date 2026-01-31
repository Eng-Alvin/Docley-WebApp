import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { UsageGuard } from '../users/guards/usage.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';

@Controller('ai')
@UseGuards(SubscriptionGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post('transform')
  @UseGuards(UsageGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute for AI endpoints
  async transform(
    @Body() body: { text: string; instruction: string; mode: string; documentId?: string },
  ) {
    return this.chatService.processText(body.text, body.instruction, body.mode, body.documentId);
  }

  @Post('polish')
  @UseGuards(UsageGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async polish(
    @Body() body: { text: string; academicLevel: string; citationStyle: string },
  ) {
    return {
      html: await this.chatService.polishText(body.text, body.academicLevel, body.citationStyle)
    };
  }
}
