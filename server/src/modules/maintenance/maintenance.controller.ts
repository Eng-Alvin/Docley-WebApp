import { Controller, Get } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';

@Controller('maintenance')
export class MaintenanceController {
    constructor(private readonly maintenanceService: MaintenanceService) { }

    @Get()
    async getMaintenanceStatus() {
        return this.maintenanceService.getMaintenanceStatus();
    }
}
