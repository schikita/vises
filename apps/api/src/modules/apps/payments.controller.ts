import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import type { PaymentsPaginatedList } from './types';
import { parsePaymentsListQuery } from './utils';
import { AppsService } from './apps.service';

/** Staff payments list + full-set summary (DEC-005 / DEC-009). */
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin', 'agent')
export class PaymentsController {
  constructor(private readonly apps: AppsService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('sortDir') sortDir?: string,
  ): Promise<PaymentsPaginatedList> {
    return this.apps.listPayments(
      parsePaymentsListQuery({ page, pageSize, sort, sortDir }),
    );
  }
}
