import { Controller, Patch, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseGuard } from '../supabase/supabase.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
@UseGuards(SupabaseGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Patch('password')
    async updatePassword(@Req() req, @Body() body: { newPassword: string }) {
        return this.usersService.updatePassword(req.user.id, body.newPassword);
    }

    @Post('sync')
    async syncUser(@Req() req) {
        // req.user is populated by SupabaseGuard
        return this.usersService.syncUser(req.user);
    }
}
