import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { User } from '../database/entities/user.entity';
import { PortalAutofillDto } from './dto/portal-autofill.dto';
import { PortalAutofillService } from './portal-autofill.service';
import type { AutofillReport, PortalAutofillRunListResponse } from './types';
import { clampPortalAutofillRunListLimit } from './utils';

/**
 * Authenticated RegisterUser autofill trigger (DEC-001 / DEC-002).
 * Sync long HTTP — await fill on the same request (DEC-007).
 * Evidence download: GET portal-autofill-runs/:runId/screenshot (DEC-003).
 * Evidence list: GET :applicationId/portal-autofill-runs (DEC-001 / DEC-004).
 */
@Controller('apps')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class PortalAutofillController {
  constructor(private readonly autofill: PortalAutofillService) {}

  /**
   * Static path segment before `:applicationId/…` routes (RISK-009).
   * GET /api/apps/portal-autofill-runs/:runId/screenshot
   */
  @Get('portal-autofill-runs/:runId/screenshot')
  async getScreenshot(
    @Param('runId') runId: string,
  ): Promise<StreamableFile> {
    const { stream, filename } =
      await this.autofill.getScreenshotStream(runId);
    return new StreamableFile(stream as import('stream').Readable, {
      type: 'image/png',
      disposition: `attachment; filename="${filename.replace(/"/g, '')}"`,
    });
  }

  /**
   * GET /api/apps/:applicationId/portal-autofill-runs?limit=&applicantId=
   * Staff list of durable run metadata incl. in_progress + eligibility (DEC-007).
   */
  @Get(':applicationId/portal-autofill-runs')
  async listRuns(
    @Param('applicationId') applicationId: string,
    @Query('limit') limitRaw?: string,
    @Query('applicantId') applicantId?: string,
  ): Promise<PortalAutofillRunListResponse> {
    const limit = clampPortalAutofillRunListLimit(limitRaw);
    return this.autofill.listRunsForApplication(
      applicationId,
      limit,
      applicantId,
    );
  }

  @Post(':applicationId/portal-autofill')
  @HttpCode(HttpStatus.OK)
  async portalAutofill(
    @Param('applicationId') applicationId: string,
    @Body() body: PortalAutofillDto,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AutofillReport> {
    const outcome = await this.autofill.runForHttp({
      applicationId,
      applicantId: body.applicantId,
      triggeredByUserId: user.id,
      supersede: body.supersede === true,
    });

    if (outcome.httpStatus !== HttpStatus.OK) {
      res.status(outcome.httpStatus);
    }

    return outcome.report;
  }
}
