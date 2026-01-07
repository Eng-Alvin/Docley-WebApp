import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Injectable()
export class AppService {
  constructor(private readonly supabaseService: SupabaseService) { }

  getHello(): string {
    return 'Docley API is running';
  }

  async getMaintenanceStatus(): Promise<boolean> {
    const { data, error } = await this.supabaseService.getClient()
      .from('global_settings')
      .select('maintenance_active')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching maintenance status:', error);
      return false;
    }

    return data?.maintenance_active || false;
  }
}
