import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/interfaces';


@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get("/get-inventary-stats")
  @Auth(Roles.ADMIN)
  getInventoryStats() {
    return this.dashboardService.getInventoryStats();
  }


}
