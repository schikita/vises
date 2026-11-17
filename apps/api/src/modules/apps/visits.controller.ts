import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import type { VisitsPaginatedList } from './types';
import { parseVisitsListQuery } from './utils';
import { AppsService } from './apps.service';

/** Staff visits list over `applications` (DEC-004 / REQ-008). */
@Controller('visits')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin', 'agent')
export class VisitsController {
  constructor(private readonly apps: AppsService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('q') q?: string,
    @Query('city') city?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('sort') sort?: string,
    @Query('sortDir') sortDir?: string,
  ): Promise<VisitsPaginatedList> {
    return this.apps.listVisits(
      parseVisitsListQuery({
        page,
        pageSize,
        q,
        city,
        from,
        to,
        sort,
        sortDir,
      }),
    );
  }
}
