import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { ApplicationDto } from '@vises/contracts';
import { ApplicationsService } from './applications.service';
import { VisaCenterMonitorGuard } from './visa-center-monitor.guard';

/**
 * Monitor-only draft|filling → not_ready_for_appointment (FR-13 / §4.C).
 * Auth: `X-Visa-Center-Monitor-Key` via {@link VisaCenterMonitorGuard}.
 */
@Controller('internal/visa-center/applications')
@UseGuards(VisaCenterMonitorGuard)
export class VisaCenterMonitorController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post(':applicationId/pending')
  @HttpCode(HttpStatus.OK)
  markPending(
    @Param('applicationId') applicationId: string,
  ): Promise<ApplicationDto> {
    return this.applications.markPendingByMonitor(applicationId);
  }
}
