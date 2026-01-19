import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { UpdateUserProfileDto, UserProfileDto } from './dto/user-profile.dto';

import { MailService } from '../mail/mail.service';

@Controller('users')
@UseGuards(SubscriptionGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) { }

  @Post('welcome')
  async sendWelcomeEmail(@Body() body: { email: string; fullName: string }) {
    // Non-blocking call
    this.mailService.sendWelcomeEmail(body.email, body.fullName).catch(() => { });
    return { success: true };
  }

  @Patch('password')
  async updatePassword(@Body() body: any, @Req() req: any) {
    const userId = req.user.id;
    return this.usersService.updatePassword(userId, body);
  }

  @Get('profile')
  async getProfile(@Req() req: any): Promise<UserProfileDto> {
    const userId = req.user.id;
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  async updateProfile(
    @Req() req: any,
    @Body() body: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    const userId = req.user.id;
    return this.usersService.updateProfile(userId, body);
  }

  @Get('check-admin')
  async checkAdmin(@Req() req: any) {
    const profile = await this.usersService.getProfile(req.user.id);
    return { isAdmin: profile.role === 'admin' };
  }

  @Post('sync')
  async syncUser(@Req() req) {
    // req.user is populated by SupabaseGuard
    return this.usersService.syncUser(req.user);
  }
}
