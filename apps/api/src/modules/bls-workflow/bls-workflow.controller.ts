import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { User } from '../database/entities/user.entity';
import { RetryBlsWorkflowDto } from './dto/retry-bls-workflow.dto';
import type { BlsPortalCredentialsOut } from './types/bls-portal-credentials.types';
import type {
  BlsWorkflowControlOut,
  BlsWorkflowEventsOut,
  BlsWorkflowOut,
} from './types/bls-workflow-api.types';
import { clampBlsWorkflowEventsLimit } from './utils/clamp-bls-workflow-events-limit.util';
import { parseBlsWorkflowSinceEventId } from './utils/parse-bls-workflow-since-event-id.util';
import { BlsWorkflowService } from './bls-workflow.service';

/**
 * Staff durable BLS workflow snapshot, events poll, and control APIs
 * (TASK-013 / TASK-014 / DEC-006 / DEC-013 / DEC-015).
 * Short POST handlers only — no Patchright in HTTP (REQ-023).
 * JWT admin|manager.
 * Snapshot/events never return secrets. The portal-credentials GET below is the
 * intentional staff secrets exception (portal-credential-reveal DEC-001).
 */
@Controller('apps')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class BlsWorkflowController {
  constructor(private readonly workflows: BlsWorkflowService) {}

  /**
   * GET /api/apps/:applicationId/bls-workflow
   * Latest workflow (active preferred via createdAt DESC among all; loadLatest).
   * Dedicated start POST removed — arm via apps upsert (DEC-015).
   */
  @Get(':applicationId/bls-workflow')
  async getSnapshot(
    @Param('applicationId') applicationId: string,
  ): Promise<BlsWorkflowOut> {
    return this.workflows.getSnapshotForApplication(applicationId);
  }

  /**
   * POST /api/apps/:applicationId/bls-workflow/:workflowId/retry
   */
  @Post(':applicationId/bls-workflow/:workflowId/retry')
  @HttpCode(HttpStatus.OK)
  async retry(
    @Param('applicationId') applicationId: string,
    @Param('workflowId') workflowId: string,
    @Body() body: RetryBlsWorkflowDto,
  ): Promise<BlsWorkflowControlOut> {
    return this.workflows.retry({
      applicationId,
      workflowId,
      taskId: body.taskId,
    });
  }

  /**
   * POST /api/apps/:applicationId/bls-workflow/:workflowId/resume
   */
  @Post(':applicationId/bls-workflow/:workflowId/resume')
  @HttpCode(HttpStatus.OK)
  async resume(
    @Param('applicationId') applicationId: string,
    @Param('workflowId') workflowId: string,
  ): Promise<BlsWorkflowControlOut> {
    return this.workflows.resume({ applicationId, workflowId });
  }

  /**
   * POST /api/apps/:applicationId/bls-workflow/:workflowId/pause
   */
  @Post(':applicationId/bls-workflow/:workflowId/pause')
  @HttpCode(HttpStatus.OK)
  async pause(
    @Param('applicationId') applicationId: string,
    @Param('workflowId') workflowId: string,
  ): Promise<BlsWorkflowControlOut> {
    return this.workflows.pause({ applicationId, workflowId });
  }

  /**
   * POST /api/apps/:applicationId/bls-workflow/:workflowId/cancel
   */
  @Post(':applicationId/bls-workflow/:workflowId/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('applicationId') applicationId: string,
    @Param('workflowId') workflowId: string,
  ): Promise<BlsWorkflowControlOut> {
    return this.workflows.cancel({ applicationId, workflowId });
  }

  /**
   * GET /api/apps/:applicationId/bls-workflow/:workflowId/events?sinceEventId=&limit=
   * Register before bare `:workflowId` so Nest does not treat "events" as id.
   */
  @Get(':applicationId/bls-workflow/:workflowId/events')
  async listEvents(
    @Param('applicationId') applicationId: string,
    @Param('workflowId') workflowId: string,
    @Query('sinceEventId') sinceEventIdRaw?: string,
    @Query('limit') limitRaw?: string,
  ): Promise<BlsWorkflowEventsOut> {
    return this.workflows.listEvents({
      applicationId,
      workflowId,
      sinceEventId: parseBlsWorkflowSinceEventId(sinceEventIdRaw),
      limit: clampBlsWorkflowEventsLimit(limitRaw),
    });
  }

  /**
   * GET /api/apps/:applicationId/bls-workflow/:workflowId/portal-credentials
   * Intentional secrets exception (DEC-001): returns portalFormEmail +
   * portalPasswordInitial (emailed 6-digit) + portalPassword (current).
   * Register before bare `:workflowId` so Nest does not treat path segment as id.
   * Snapshot/events routes remain secret-free.
   */
  @Get(':applicationId/bls-workflow/:workflowId/portal-credentials')
  async revealPortalCredentials(
    @Param('applicationId') applicationId: string,
    @Param('workflowId') workflowId: string,
    @CurrentUser() user: User,
  ): Promise<BlsPortalCredentialsOut> {
    return this.workflows.revealPortalCredentials({
      applicationId,
      workflowId,
      actorUserId: user.id,
    });
  }

  /**
   * GET /api/apps/:applicationId/bls-workflow/:workflowId
   * Explicit workflow id snapshot (optional path in 03-workflow-api).
   */
  @Get(':applicationId/bls-workflow/:workflowId')
  async getSnapshotById(
    @Param('applicationId') applicationId: string,
    @Param('workflowId') workflowId: string,
  ): Promise<BlsWorkflowOut> {
    return this.workflows.getSnapshotById(applicationId, workflowId);
  }
}
