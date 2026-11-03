import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { AnalyticsDto } from '@vises/contracts';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import {
  ADMIN_ROLE,
  AGENT_ROLE,
  SUPERADMIN_ROLE,
} from '../auth/constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../database/entities/user.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { parseAnalyticsDateRange, parseAnalyticsPagination } from './utils';

/**
 * Roles-and-applications analytics (FR-9 / §6.7 / AC-15).
 * Path: `GET /stats/roles-applications` (global prefix `/api`).
 * Legacy `GET /stats/dashboard` remains on StatsModule.
 */
@Controller('stats')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('roles-applications')
  @UseGuards(RolesGuard)
  @Roles(ADMIN_ROLE, SUPERADMIN_ROLE, AGENT_ROLE)
  getRolesApplications(
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() actor: User,
  ): Promise<AnalyticsDto> {
    return this.analytics.getRolesApplications(
      actor,
      parseAnalyticsDateRange({ from: query.from, to: query.to }),
      parseAnalyticsPagination({
        page: query.page,
        pageSize: query.pageSize,
      }),
      (query.q ?? '').trim(),
    );
  }
}
