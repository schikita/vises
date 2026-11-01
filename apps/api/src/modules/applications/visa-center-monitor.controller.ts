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
 * Monitor-only drafting → pending (FR-7.4 / AC-13).
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
