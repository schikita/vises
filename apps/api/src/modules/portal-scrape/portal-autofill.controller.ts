import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { PORTAL_AUTOFILL_MSG_GONE } from './constants';
import { PortalAutofillService } from './portal-autofill.service';
import type { PortalAutofillRunListResponse } from './types';
import { clampPortalAutofillRunListLimit } from './utils';

/**
 * Evidence download: GET portal-autofill-runs/:runId/screenshot (DEC-003).
 * Evidence list: GET :applicationId/portal-autofill-runs (DEC-001 / DEC-004).
 * Staff POST portal-autofill is hard-cut to 410 Gone (portal-autofill-workflow-cutover DEC-002).
 */
@Controller('apps')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin', 'agent')
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

  /**
   * Former RegisterUser execute path — non-executing 410 (DEC-002 / REQ-003).
   * Registration starts only via BLS workflow.
   */
  @Post(':applicationId/portal-autofill')
  portalAutofill(): never {
    throw new HttpException(PORTAL_AUTOFILL_MSG_GONE, HttpStatus.GONE);
  }
}
