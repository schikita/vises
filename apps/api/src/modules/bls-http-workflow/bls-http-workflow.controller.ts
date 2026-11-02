import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { User } from '../database/entities/user.entity';
import {
  RetryBlsHttpWorkflowDto,
  SetBlsHttpWorkflowPortalCredentialsDto,
  StartBlsHttpWorkflowDto,
} from './dto';
import type { BlsPortalCredentialsOut } from './types/bls-portal-credentials.types';
import type {
  BlsHttpWorkflowControlOut,
  BlsHttpWorkflowEventsOut,
  BlsHttpWorkflowOut,
} from './types/bls-http-workflow-api.types';
import { clampBlsHttpWorkflowEventsLimit } from './utils/clamp-bls-http-workflow-events-limit.util';
import { parseBlsHttpWorkflowSinceEventId } from './utils/parse-bls-http-workflow-since-event-id.util';
import { BlsHttpWorkflowService } from './bls-http-workflow.service';

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
export class BlsHttpWorkflowController {
  constructor(private readonly workflows: BlsHttpWorkflowService) {}

  /**
   * GET /api/apps/:applicationId/bls-http-workflow
   * Latest workflow (active preferred via createdAt DESC among all; loadLatest).
   * Unlike the legacy engine (armed via apps upsert, DEC-015), the parallel
   * HTTP engine exposes its own start POST below so the legacy upsert path
   * stays untouched.
   */
  @Get(':applicationId/bls-http-workflow')
  async getSnapshot(
    @Param('applicationId') applicationId: string,
  ): Promise<BlsHttpWorkflowOut> {
    return this.workflows.getSnapshotForApplication(applicationId);
  }

  /**
   * POST /api/apps/:applicationId/bls-http-workflow/start
   * Arm the HTTP engine: ensure (idempotent; 409-free when active exists) or
   * supersede (abandon active, create a new graph). Server-side start gate
   * (completeness + travel date) applies. No Rabbit nudge needed — the worker
   * runner polls due workflows every tick.
   */
  @Post(':applicationId/bls-http-workflow/start')
  @HttpCode(HttpStatus.OK)
  async start(
    @Param('applicationId') applicationId: string,
    @Body() body: StartBlsHttpWorkflowDto,
    @CurrentUser() user: User,
  ): Promise<BlsHttpWorkflowOut> {
    await this.workflows.ensureForApplication({
      applicationId,
      triggeredByUserId: user.id,
      action: body.supersede === true ? 'supersede' : 'ensure',
    });
    return this.workflows.getSnapshotForApplication(applicationId);
  }

  /**
   * POST /api/apps/:applicationId/bls-http-workflow/:workflowId/retry
   */
  @Post(':applicationId/bls-http-workflow/:workflowId/retry')
  @HttpCode(HttpStatus.OK)
  async retry(
    @Param('applicationId') applicationId: string,
    @Param('workflowId') workflowId: string,
    @Body() body: RetryBlsHttpWorkflowDto,
  ): Promise<BlsHttpWorkflowControlOut> {
    return this.workflows.retry({
      applicationId,
      workflowId,
      taskId: body.taskId,
    });
  }

  /**
   * POST /api/apps/:applicationId/bls-http-workflow/:workflowId/resume
   */
  @Post(':applicationId/bls-http-workflow/:workflowId/resume')
  @HttpCode(HttpStatus.OK)
  async resume(
    @Param('applicationId') applicationId: string,
    @Param('workflowId') workflowId: string,
  ): Promise<BlsHttpWorkflowControlOut> {
    return this.workflows.resume({ applicationId, workflowId });
  }

  /**
   * POST /api/apps/:applicationId/bls-http-workflow/:workflowId/pause
   */
  @Post(':applicationId/bls-http-workflow/:workflowId/pause')
  @HttpCode(HttpStatus.OK)
  async pause(
    @Param('applicationId') applicationId: string,
    @Param('workflowId') workflowId: string,
  ): Promise<BlsHttpWorkflowControlOut> {
    return this.workflows.pause({ applicationId, workflowId });
  }

  /**
   * POST /api/apps/:applicationId/bls-http-workflow/:workflowId/cancel
   */
  @Post(':applicationId/bls-http-workflow/:workflowId/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('applicationId') applicationId: string,
    @Param('workflowId') workflowId: string,
  ): Promise<BlsHttpWorkflowControlOut> {
    return this.workflows.cancel({ applicationId, workflowId });
  }

  /**
   * GET /api/apps/:applicationId/bls-http-workflow/:workflowId/events?sinceEventId=&limit=
   * Register before bare `:workflowId` so Nest does not treat "events" as id.
   */
  @Get(':applicationId/bls-http-workflow/:workflowId/events')
  async listEvents(
    @Param('applicationId') applicationId: string,
    @Param('workflowId') workflowId: string,
    @Query('sinceEventId') sinceEventIdRaw?: string,
    @Query('limit') limitRaw?: string,
  ): Promise<BlsHttpWorkflowEventsOut> {
    return this.workflows.listEvents({
      applicationId,
      workflowId,
      sinceEventId: parseBlsHttpWorkflowSinceEventId(sinceEventIdRaw),
      limit: clampBlsHttpWorkflowEventsLimit(limitRaw),
    });
  }

  /**
   * PUT /api/apps/:applicationId/bls-http-workflow/portal-credentials
   * Staff records the portal password when the portal account exists but its
   * secret is not in the vault (registered outside the engines). Lets the
   * flow reuse the existing account instead of re-registering (the portal
   * allows one account per passport).
   */
  @Put(':applicationId/bls-http-workflow/portal-credentials')
  async setPortalCredentials(
    @Param('applicationId') applicationId: string,
    @Body() body: SetBlsHttpWorkflowPortalCredentialsDto,
  ): Promise<{ ok: true }> {
    return this.workflows.setPortalCredential({
      applicationId,
      portalPassword: body.portalPassword,
    });
  }

  /**
   * GET /api/apps/:applicationId/bls-http-workflow/:workflowId/portal-credentials
   * Intentional secrets exception (DEC-001): returns portalFormEmail +
   * portalPasswordInitial (emailed 6-digit) + portalPassword (current).
   * Register before bare `:workflowId` so Nest does not treat path segment as id.
   * Snapshot/events routes remain secret-free.
   */
  @Get(':applicationId/bls-http-workflow/:workflowId/portal-credentials')
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
   * GET /api/apps/:applicationId/bls-http-workflow/:workflowId
   * Explicit workflow id snapshot (optional path in 03-workflow-api).
   */
  @Get(':applicationId/bls-http-workflow/:workflowId')
  async getSnapshotById(
    @Param('applicationId') applicationId: string,
    @Param('workflowId') workflowId: string,
  ): Promise<BlsHttpWorkflowOut> {
    return this.workflows.getSnapshotById(applicationId, workflowId);
  }
}
