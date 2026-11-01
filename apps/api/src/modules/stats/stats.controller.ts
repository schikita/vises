import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { OwnerDashboardStatsOut } from './types';
import { StatsService } from './stats.service';
import { parseDashboardRangeDays } from './utils';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  /**
   * Staff dashboard aggregates (owner charts + home/manager KPIs).
   * Admin + manager. Day series use UTC calendar days; `appsByStatus` is all apps.
   */
  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles('admin', 'superadmin', 'agent')
  getDashboard(
    @Query('rangeDays') rangeDaysRaw?: string,
  ): Promise<OwnerDashboardStatsOut> {
    return this.stats.getDashboard(parseDashboardRangeDays(rangeDaysRaw));
  }
}
