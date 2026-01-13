import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';

@Injectable()
export class MaintenanceService {
    constructor(private readonly supabaseService: SupabaseService) { }

    private get supabase() {
        return this.supabaseService.getClient();
    }

    async getMaintenanceStatus(): Promise<{ maintenance_active: boolean }> {
        try {
            const { data, error } = await this.supabase
                .from('global_settings')
                .select('maintenance_active')
                .eq('id', 1)
                .single();

            if (error) {
                console.error('Failed to fetch maintenance status:', error.message);
                // Default to false (not in maintenance) if we can't fetch
                return { maintenance_active: false };
            }

            return { maintenance_active: data?.maintenance_active ?? false };
        } catch (err) {
            console.error('Maintenance status check failed:', err);
            return { maintenance_active: false };
        }
    }
}
