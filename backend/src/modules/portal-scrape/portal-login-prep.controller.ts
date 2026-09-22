import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { PortalLoginPrepService } from './portal-login-prep.service';
import type { PortalLoginPrepReport } from './types';

/**
 * Staff portal login preparation trigger (DEC-002).
 * Sync long HTTP — await prep on the same request (mirror autofill).
 * POST /api/apps/:applicationId/portal-login-prep
 */
@Controller('apps')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class PortalLoginPrepController {
  constructor(private readonly loginPrep: PortalLoginPrepService) {}

  @Post(':applicationId/portal-login-prep')
  @HttpCode(HttpStatus.OK)
  async portalLoginPrep(
    @Param('applicationId') applicationId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PortalLoginPrepReport> {
    const outcome = await this.loginPrep.runForHttp(applicationId);

    if (outcome.httpStatus !== HttpStatus.OK) {
      res.status(outcome.httpStatus);
    }

    return outcome.report;
  }
}
