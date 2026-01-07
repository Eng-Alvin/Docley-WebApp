import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('maintenance')
  async getMaintenance() {
    const active = await this.appService.getMaintenanceStatus();
    return { maintenance_active: active };
  }

  @Get('diagnostic/feedback')
  async checkFeedback() {
    try {
      const client = (this.appService as any).supabaseService.getClient();
      const { data, error } = await client.from('feedback').select('id').limit(1);
      if (error) return { status: 'error', message: error.message };
      return { status: 'ok', tableExists: true };
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  }
}
