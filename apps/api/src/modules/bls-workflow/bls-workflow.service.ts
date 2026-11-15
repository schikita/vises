import { randomUUID } from 'crypto';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WORKFLOW_ROUTING_KEYS } from '@vises/contracts';
import { Repository } from 'typeorm';
import { Application } from '../database/entities/application.entity';
import { uid } from '../../shared/utils';
import { WorkflowBusPublisherService } from '../messaging';
import {
  BLS_SECRET_PURPOSE,
  BLS_WORKFLOW_EVENT_TYPE,
  BLS_WORKFLOW_MSG_ACTIVE_EXISTS,
  BLS_WORKFLOW_MSG_APP_NOT_FOUND,
  BLS_WORKFLOW_MSG_CANCEL_NOT_ELIGIBLE,
  BLS_WORKFLOW_MSG_COMPLETE_WITHOUT_VERIFY,
  BLS_WORKFLOW_MSG_LIVE_LOCK,
  BLS_WORKFLOW_MSG_NOT_FOUND,
  BLS_WORKFLOW_MSG_PAUSE_NOT_ELIGIBLE,
  BLS_WORKFLOW_MSG_PORTAL_CREDENTIALS_EMAIL_MISSING,
  BLS_WORKFLOW_MSG_PORTAL_CREDENTIALS_NOT_ELIGIBLE,
  BLS_WORKFLOW_MSG_PORTAL_CREDENTIALS_PASSWORD_MISSING,
  BLS_WORKFLOW_MSG_PORTAL_CREDENTIALS_INITIAL_PASSWORD_MISSING,
  BLS_WORKFLOW_MSG_RESUME_NOT_ELIGIBLE,
  BLS_WORKFLOW_MSG_RETRY_NOT_ELIGIBLE,
  BLS_WORKFLOW_MSG_STEP_NOT_FOUND,
  BLS_WORKFLOW_MSG_STEP_NOT_SKIPPABLE,
  BLS_WORKFLOW_MSG_SUPERSEDED,
  BLS_WORKFLOW_MSG_TASK_NOT_FOUND,
  BLS_WORKFLOW_MSG_TERMINAL,
  BLS_WORKFLOW_SCHEMA_VERSION_DEFAULT,
  BLS_WORKFLOW_STATUS,
  BLS_WORKFLOW_STEP_STATUS,
  BLS_WORKFLOW_TASK_MAX_ATTEMPTS_DEFAULT,
  BLS_WORKFLOW_TASK_STATUS,
} from './constants/bls-workflow.constants';
import { BlsSecretVaultService } from '../bls-secrets/bls-secret-vault.service';
import type {
  AppendBlsWorkflowEventInput,
  BlsWorkflowControlInput,
  BlsWorkflowControlOut,
  BlsWorkflowEventsOut,
  BlsWorkflowOut,
  ListBlsWorkflowEventsInput,
  RetryBlsWorkflowInput,
} from './types/bls-workflow-api.types';
import type {
  BlsPortalCredentialsOut,
  RevealBlsPortalCredentialsInput,
} from './types/bls-portal-credentials.types';
import type {
  AbandonBlsWorkflowInput,
  AdvanceBlsWorkflowInput,
  BlsWorkflowGraph,
  CreateBlsWorkflowInput,
  FailBlsWorkflowTaskInput,
  SkipBlsWorkflowStepInput,
} from './types/bls-workflow-graph.types';
import { assertBlsCompleteVerified } from './utils/assert-bls-complete-verified.util';
import { buildBlsWorkflowGraphDraft } from './utils/build-bls-workflow-graph-draft.util';
import { evaluateBlsWorkflowStartGate } from './utils/evaluate-bls-workflow-start-gate.util';
import { findNextBlsWorkflowOpenTask } from './utils/find-next-bls-workflow-open-task.util';
import { findCurrentBlsWorkflowReadyTask } from './utils/find-current-bls-workflow-ready-task.util';
import { applyApplicationNeedsFixesStatus } from '../apps/utils/apply-application-needs-fixes-status.util';
import { hasBlsWorkflowLiveNonStaleLock } from './utils/has-bls-workflow-live-non-stale-lock.util';
import { isBlsWorkflowManualRetryEligible } from './utils/is-bls-workflow-manual-retry-eligible.util';
import { isBlsWorkflowPauseEligible } from './utils/is-bls-workflow-pause-eligible.util';
import { isBlsWorkflowPortalCredentialsRevealEligible } from './utils/is-bls-workflow-portal-credentials-reveal-eligible.util';
import { isBlsWorkflowResumeEligible } from './utils/is-bls-workflow-resume-eligible.util';
import { isBlsWorkflowStatusNonRunnable } from './utils/is-bls-workflow-status-non-runnable.util';
import { isBlsWorkflowStatusTerminal } from './utils/is-bls-workflow-status-terminal.util';
import { isBlsWorkflowStepSkippable } from './utils/is-bls-workflow-step-skippable.util';
import { listApplicationApplicantIds } from '../portal-core/utils/list-application-applicant-ids.util';
import { mapBlsWorkflowEventToOut } from './utils/map-bls-workflow-event-to-out.util';
import { mapBlsWorkflowGraphToOut } from './utils/map-bls-workflow-graph-to-out.util';
import { mapBlsWorkflowToControlOut } from './utils/map-bls-workflow-to-control-out.util';
import { planBlsWorkflowAdvance } from './utils/plan-bls-workflow-advance.util';
import { resolveBlsWorkflowManualRetryTask } from './utils/resolve-bls-workflow-manual-retry-task.util';
import { BlsWorkflowAbortRegistry } from './bls-workflow-abort.registry';
import { BlsWorkflowTerminalCleanupService } from './bls-workflow-terminal-cleanup.service';
import { BlsWorkflowRepository } from './bls-workflow.repository';

/**
 * Durable BLS workflow state machine: create / load / advance / skip / fail / abandon.
 * One active workflow per application (REQ-001 / DEC-013).
 * BOOK success → AWAITING_STAFF_BOOKING (DEC-010 / DEC-004 materials-covered
 * unknown-next — not open-UI-only). COMPLETED requires verify (REQ-007).
 * Portal credentials reveal: intentional secrets exception (DEC-001); snapshot/events stay clean.
 */
@Injectable()
export class BlsWorkflowService {
  private readonly logger = new Logger(BlsWorkflowService.name);

  constructor(
    private readonly workflows: BlsWorkflowRepository,
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
    private readonly terminalCleanup: BlsWorkflowTerminalCleanupService,
    private readonly secretVault: BlsSecretVaultService,
    private readonly abortRegistry: BlsWorkflowAbortRegistry,
    private readonly workflowBus: WorkflowBusPublisherService,
  ) {}

  /**
   * Create workflow graph (PENDING). Optional supersede → prior ABANDONED.
   */
  async create(input: CreateBlsWorkflowInput): Promise<BlsWorkflowGraph> {
    const app = await this.appRepo.findOne({
      where: { id: input.applicationId },
    });
    if (!app) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_APP_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    // Pre-start Completeness + date gate before supersede abandon / graph
    // persist (DEC-001 / REQ-001). On failure → «Нужны правки» then HTTP 400.
    await this.enforceStartGateOrThrow(app);

    const active = await this.workflows.findActiveByApplicationId(
      input.applicationId,
    );
    if (active) {
      if (input.supersede !== true) {
        throw new HttpException(
          BLS_WORKFLOW_MSG_ACTIVE_EXISTS,
          HttpStatus.CONFLICT,
        );
      }
      await this.abandon({
        workflowId: active.id,
        reason: BLS_WORKFLOW_MSG_SUPERSEDED,
      });
    }

    // T2 stub: applicants jsonb removed; empty until Client wiring (T12).
    const applicantIds = listApplicationApplicantIds([]);
    const draft = buildBlsWorkflowGraphDraft({ applicantIds });
    const now = new Date();
    const workflowId = uid('bls-wf');

    const firstStep = draft.steps[0];
    const firstTask = firstStep?.tasks[0];

    const workflow = this.workflows.createWorkflowEntity({
      id: workflowId,
      applicationId: input.applicationId,
      status: BLS_WORKFLOW_STATUS.PENDING,
      terminalReason: null,
      nextRunAt: now,
      lockOwner: null,
      lockHeartbeatAt: null,
      currentStepKey: firstStep?.stepKey ?? null,
      currentTaskKey: firstTask?.taskKey ?? null,
      supersedesWorkflowId: active?.id ?? null,
      triggeredByUserId: input.triggeredByUserId ?? null,
      schemaVersion: BLS_WORKFLOW_SCHEMA_VERSION_DEFAULT,
      createdAt: now,
      updatedAt: now,
    });
    await this.workflows.saveWorkflow(workflow);

    const stepEntities = [];
    const taskEntities = [];

    for (let si = 0; si < draft.steps.length; si++) {
      const stepDraft = draft.steps[si]!;
      const stepId = uid('bls-ws');
      const isFirst = si === 0;
      const hasTasks = stepDraft.tasks.length > 0;
      const stepStatus = !hasTasks
        ? BLS_WORKFLOW_STEP_STATUS.COMPLETED
        : isFirst
          ? BLS_WORKFLOW_STEP_STATUS.READY
          : BLS_WORKFLOW_STEP_STATUS.PENDING;

      stepEntities.push(
        this.workflows.createStepEntity({
          id: stepId,
          workflowId,
          stepKey: stepDraft.stepKey,
          ordinal: stepDraft.ordinal,
          status: stepStatus,
          skipReason: null,
          portalAutofillRunId: null,
          startedAt: null,
          completedAt: !hasTasks ? now : null,
        }),
      );

      for (let ti = 0; ti < stepDraft.tasks.length; ti++) {
        const taskDraft = stepDraft.tasks[ti]!;
        const isFirstTask = isFirst && ti === 0;
        taskEntities.push(
          this.workflows.createTaskEntity({
            id: uid('bls-wt'),
            stepId,
            taskKey: taskDraft.taskKey,
            applicantId: taskDraft.applicantId,
            ordinal: taskDraft.ordinal,
            status: isFirstTask
              ? BLS_WORKFLOW_TASK_STATUS.READY
              : BLS_WORKFLOW_TASK_STATUS.PENDING,
            attemptCount: 0,
            maxAttempts: BLS_WORKFLOW_TASK_MAX_ATTEMPTS_DEFAULT,
            lastErrorClass: null,
            lastErrorCode: null,
            lastErrorMessage: null,
            nextRunAt: null,
          }),
        );
      }
    }

    await this.workflows.saveSteps(stepEntities);
    await this.workflows.saveTasks(taskEntities);

    await this.appendEvent({
      workflowId,
      eventType: BLS_WORKFLOW_EVENT_TYPE.WORKFLOW_CREATED,
      stepKey: firstStep?.stepKey ?? null,
      taskKey: firstTask?.taskKey ?? null,
      payloadSafe: {
        applicationId: input.applicationId,
        status: BLS_WORKFLOW_STATUS.PENDING,
        supersede: input.supersede === true,
      },
    });

    const graph = await this.workflows.loadGraph(workflowId);
    if (!graph) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return graph;
  }

  /**
   * Append-only audit / UI event (REQ-029). Safe payload only — never secrets.
   * Best-effort from transitions; runner may also call.
   */
  async appendEvent(
    input: AppendBlsWorkflowEventInput,
  ): Promise<void> {
    await this.workflows.appendEvent({
      workflowId: input.workflowId,
      eventType: input.eventType,
      stepKey: input.stepKey ?? null,
      taskKey: input.taskKey ?? null,
      payloadSafe: input.payloadSafe ?? {},
    });
  }

  /**
   * Upsert-triggered ensure / supersede (DEC-015). Replaces dedicated start HTTP.
   * Returns whether a new graph was created and the active workflow id.
   */
  async ensureForApplication(input: {
    applicationId: string;
    triggeredByUserId: string;
    action: 'ensure' | 'supersede' | 'none';
  }): Promise<{
    workflowId?: string;
    workflowAction: 'ensure' | 'supersede' | 'none';
    created: boolean;
  }> {
    if (input.action === 'none') {
      const active = await this.loadActiveForApplication(input.applicationId);
      return {
        workflowId: active?.workflow.id,
        workflowAction: 'none',
        created: false,
      };
    }

    const active = await this.loadActiveForApplication(input.applicationId);
    if (active && input.action === 'ensure') {
      return {
        workflowId: active.workflow.id,
        workflowAction: 'ensure',
        created: false,
      };
    }

    const graph = await this.create({
      applicationId: input.applicationId,
      supersede: input.action === 'supersede',
      triggeredByUserId: input.triggeredByUserId,
    });
    return {
      workflowId: graph.workflow.id,
      workflowAction: input.action,
      created: true,
    };
  }

  /**
   * Latest workflow snapshot for application (active preferred, else newest).
   * No secrets in response (REQ-024 / DEC-015).
   */
  async getSnapshotForApplication(
    applicationId: string,
  ): Promise<BlsWorkflowOut> {
    const app = await this.appRepo.findOne({
      where: { id: applicationId },
    });
    if (!app) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_APP_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const active = await this.loadActiveForApplication(applicationId);
    const graph =
      active ?? (await this.loadLatestForApplication(applicationId));
    if (!graph) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return mapBlsWorkflowGraphToOut(graph);
  }

  /**
   * Explicit workflow id snapshot; must belong to applicationId.
   */
  async getSnapshotById(
    applicationId: string,
    workflowId: string,
  ): Promise<BlsWorkflowOut> {
    const graph = await this.requireGraphForApplication(
      applicationId,
      workflowId,
    );
    return mapBlsWorkflowGraphToOut(graph);
  }

  /**
   * Incremental events poll (DEC-006). No WS/SSE.
   */
  async listEvents(
    input: ListBlsWorkflowEventsInput,
  ): Promise<BlsWorkflowEventsOut> {
    const graph = await this.requireGraphForApplication(
      input.applicationId,
      input.workflowId,
    );
    const rows = await this.workflows.listEventsSince({
      workflowId: input.workflowId,
      sinceEventId: input.sinceEventId,
      limit: input.limit,
    });
    const latestEventId = await this.workflows.findLatestEventId(
      input.workflowId,
    );
    return {
      workflowId: input.workflowId,
      workflowStatus: graph.workflow.status,
      events: rows.map(mapBlsWorkflowEventToOut),
      latestEventId,
    };
  }

  /**
   * Staff reveal of portalFormEmail + decrypted initial + current portal passwords.
   * Atomic fail-closed (DEC-008); status gate (DEC-002); audit event without secrets (DEC-006).
   * Never returns clientEmail. Never logs plaintext password.
   */
  async revealPortalCredentials(
    input: RevealBlsPortalCredentialsInput,
  ): Promise<BlsPortalCredentialsOut> {
    const app = await this.appRepo.findOne({
      where: { id: input.applicationId },
    });
    if (!app) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_APP_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const graph = await this.requireGraphForApplication(
      input.applicationId,
      input.workflowId,
    );

    if (!isBlsWorkflowPortalCredentialsRevealEligible(graph.workflow.status)) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_PORTAL_CREDENTIALS_NOT_ELIGIBLE,
        HttpStatus.CONFLICT,
      );
    }

    const portalFormEmail = app.portalFormEmail?.trim() ?? '';
    if (!portalFormEmail) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_PORTAL_CREDENTIALS_EMAIL_MISSING,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const portalPasswordInitial = await this.secretVault.loadSecretPlain({
      workflowId: input.workflowId,
      purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD_INITIAL,
    });
    const initialTrimmed = portalPasswordInitial?.trim() ?? '';
    if (!initialTrimmed) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_PORTAL_CREDENTIALS_INITIAL_PASSWORD_MISSING,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const portalPassword = await this.secretVault.loadSecretPlain({
      workflowId: input.workflowId,
      purpose: BLS_SECRET_PURPOSE.PORTAL_PASSWORD,
    });
    const passwordTrimmed = portalPassword?.trim() ?? '';
    if (!passwordTrimmed) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_PORTAL_CREDENTIALS_PASSWORD_MISSING,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    await this.appendEvent({
      workflowId: input.workflowId,
      eventType: BLS_WORKFLOW_EVENT_TYPE.PORTAL_CREDENTIALS_REVEALED,
      payloadSafe: { actorUserId: input.actorUserId },
    });

    this.logger.log(
      `bls_portal_credentials_revealed applicationId=${input.applicationId} workflowId=${input.workflowId} actorUserId=${input.actorUserId}`,
    );

    return {
      applicationId: input.applicationId,
      workflowId: input.workflowId,
      portalFormEmail,
      portalPasswordInitial: initialTrimmed,
      portalPassword: passwordTrimmed,
    };
  }

  /**
   * Staff manual retry: reset attempt budget, clear human gate, schedule now.
   * Live lock → 409. Does not run browser work (REQ-023).
   */
  async retry(input: RetryBlsWorkflowInput): Promise<BlsWorkflowControlOut> {
    const graph = await this.requireGraphForApplication(
      input.applicationId,
      input.workflowId,
    );
    this.assertNotTerminal(graph.workflow.status);
    this.assertNoLiveLock(graph);

    const targetMeta = resolveBlsWorkflowManualRetryTask({
      tasks: graph.tasks.map((t) => ({
        id: t.id,
        taskKey: t.taskKey,
        status: t.status,
        ordinal: t.ordinal,
      })),
      currentTaskKey: graph.workflow.currentTaskKey,
      taskId: input.taskId,
    });
    if (!targetMeta) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_RETRY_NOT_ELIGIBLE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const task = graph.tasks.find((t) => t.id === targetMeta.id);
    if (!task) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_TASK_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      !isBlsWorkflowManualRetryEligible({
        workflowStatus: graph.workflow.status,
        taskStatus: task.status,
      })
    ) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_RETRY_NOT_ELIGIBLE,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Re-entry Completeness + date gate before task/schedule mutation (REQ-004 / DEC-002).
    const retryApp = await this.appRepo.findOne({
      where: { id: input.applicationId },
    });
    if (!retryApp) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_APP_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.enforceStartGateOrThrow(retryApp);

    const now = new Date();
    const step = graph.steps.find((s) => s.id === task.stepId);

    task.status = BLS_WORKFLOW_TASK_STATUS.READY;
    task.attemptCount = 0;
    task.lastErrorClass = null;
    task.lastErrorCode = null;
    task.lastErrorMessage = null;
    task.nextRunAt = null;
    await this.workflows.saveTask(task);

    if (step && step.status === BLS_WORKFLOW_STEP_STATUS.FAILED) {
      step.status = BLS_WORKFLOW_STEP_STATUS.READY;
      step.completedAt = null;
      await this.workflows.saveStep(step);
    }

    const workflow = graph.workflow;
    workflow.status = BLS_WORKFLOW_STATUS.PENDING;
    workflow.terminalReason = null;
    workflow.nextRunAt = now;
    workflow.currentStepKey = step?.stepKey ?? workflow.currentStepKey;
    workflow.currentTaskKey = task.taskKey;
    workflow.updatedAt = now;
    await this.workflows.saveWorkflow(workflow);

    await this.appendEvent({
      workflowId: workflow.id,
      eventType: BLS_WORKFLOW_EVENT_TYPE.WORKFLOW_STATUS_CHANGED,
      stepKey: step?.stepKey ?? null,
      taskKey: task.taskKey,
      payloadSafe: {
        status: BLS_WORKFLOW_STATUS.PENDING,
        action: 'retry',
        taskId: task.id,
      },
    });

    await this.publishScheduleNudge(workflow.id, input.applicationId);

    return mapBlsWorkflowToControlOut(await this.requireGraph(workflow.id));
  }

  /**
   * Staff resume: unpause / schedule now without resetting attempt budget.
   * Live lock → 409. Does not run browser work (REQ-023).
   */
  async resume(input: BlsWorkflowControlInput): Promise<BlsWorkflowControlOut> {
    const graph = await this.requireGraphForApplication(
      input.applicationId,
      input.workflowId,
    );
    this.assertNotTerminal(graph.workflow.status);
    this.assertNoLiveLock(graph);

    if (!isBlsWorkflowResumeEligible(graph.workflow.status)) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_RESUME_NOT_ELIGIBLE,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Re-entry Completeness + date gate before schedule mutation (REQ-004 / DEC-002).
    const resumeApp = await this.appRepo.findOne({
      where: { id: input.applicationId },
    });
    if (!resumeApp) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_APP_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.enforceStartGateOrThrow(resumeApp);

    const now = new Date();
    const workflow = graph.workflow;
    const priorStatus = workflow.status;

    if (priorStatus === BLS_WORKFLOW_STATUS.WAITING_STAFF) {
      const targetMeta = resolveBlsWorkflowManualRetryTask({
        tasks: graph.tasks.map((t) => ({
          id: t.id,
          taskKey: t.taskKey,
          status: t.status,
          ordinal: t.ordinal,
        })),
        currentTaskKey: workflow.currentTaskKey,
        taskId: null,
      });
      if (targetMeta) {
        const task = graph.tasks.find((t) => t.id === targetMeta.id);
        if (task) {
          task.status = BLS_WORKFLOW_TASK_STATUS.READY;
          task.nextRunAt = null;
          await this.workflows.saveTask(task);
          workflow.currentTaskKey = task.taskKey;
        }
      }
    }

    workflow.status = BLS_WORKFLOW_STATUS.PENDING;
    workflow.nextRunAt = now;
    workflow.updatedAt = now;
    await this.workflows.saveWorkflow(workflow);

    await this.appendEvent({
      workflowId: workflow.id,
      eventType: BLS_WORKFLOW_EVENT_TYPE.WORKFLOW_STATUS_CHANGED,
      stepKey: workflow.currentStepKey,
      taskKey: workflow.currentTaskKey,
      payloadSafe: {
        status: BLS_WORKFLOW_STATUS.PENDING,
        action: 'resume',
        priorStatus,
      },
    });

    await this.publishScheduleNudge(workflow.id, input.applicationId);

    return mapBlsWorkflowToControlOut(await this.requireGraph(workflow.id));
  }

  /**
   * Staff pause: set PAUSED, clear schedules, signal immediate abort (DEC-002).
   * Does not await browser teardown on the HTTP path (NFR-001).
   */
  async pause(input: BlsWorkflowControlInput): Promise<BlsWorkflowControlOut> {
    const graph = await this.requireGraphForApplication(
      input.applicationId,
      input.workflowId,
    );

    if (graph.workflow.status === BLS_WORKFLOW_STATUS.PAUSED) {
      this.abortRegistry.requestAbort(graph.workflow.id);
      return mapBlsWorkflowToControlOut(graph);
    }

    this.assertNotTerminal(graph.workflow.status);

    if (!isBlsWorkflowPauseEligible(graph.workflow.status)) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_PAUSE_NOT_ELIGIBLE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const now = new Date();
    const workflow = graph.workflow;
    const priorStatus = workflow.status;
    workflow.status = BLS_WORKFLOW_STATUS.PAUSED;
    workflow.nextRunAt = null;
    workflow.updatedAt = now;
    await this.workflows.saveWorkflow(workflow);
    await this.clearCurrentTaskNextRunAt(graph);

    await this.appendEvent({
      workflowId: workflow.id,
      eventType: BLS_WORKFLOW_EVENT_TYPE.WORKFLOW_STATUS_CHANGED,
      stepKey: workflow.currentStepKey,
      taskKey: workflow.currentTaskKey,
      payloadSafe: {
        status: BLS_WORKFLOW_STATUS.PAUSED,
        action: 'pause',
        priorStatus,
      },
    });

    this.abortRegistry.requestAbort(workflow.id);
    await this.publishAbort(workflow.id, input.applicationId, 'pause');

    return mapBlsWorkflowToControlOut(await this.requireGraph(workflow.id));
  }

  /**
   * Staff cancel → CANCELLED; release lock; terminal cleanup; signal abort (REQ-003 / DEC-002).
   */
  async cancel(input: BlsWorkflowControlInput): Promise<BlsWorkflowControlOut> {
    const graph = await this.requireGraphForApplication(
      input.applicationId,
      input.workflowId,
    );

    if (graph.workflow.status === BLS_WORKFLOW_STATUS.CANCELLED) {
      this.abortRegistry.requestAbort(graph.workflow.id);
      return mapBlsWorkflowToControlOut(graph);
    }

    if (isBlsWorkflowStatusTerminal(graph.workflow.status)) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_CANCEL_NOT_ELIGIBLE,
        HttpStatus.CONFLICT,
      );
    }

    const now = new Date();
    const workflow = graph.workflow;
    workflow.status = BLS_WORKFLOW_STATUS.CANCELLED;
    workflow.terminalReason = 'cancelled_by_staff';
    workflow.nextRunAt = null;
    workflow.lockOwner = null;
    workflow.lockHeartbeatAt = null;
    workflow.updatedAt = now;
    await this.workflows.saveWorkflow(workflow);
    await this.clearCurrentTaskNextRunAt(graph);

    await this.appendEvent({
      workflowId: workflow.id,
      eventType: BLS_WORKFLOW_EVENT_TYPE.WORKFLOW_STATUS_CHANGED,
      stepKey: workflow.currentStepKey,
      taskKey: workflow.currentTaskKey,
      payloadSafe: { status: BLS_WORKFLOW_STATUS.CANCELLED, action: 'cancel' },
    });

    await this.terminalCleanup.cleanupAfterTerminal({ workflowId: workflow.id });

    this.abortRegistry.requestAbort(workflow.id);
    await this.publishAbort(workflow.id, input.applicationId, 'cancel');

    return mapBlsWorkflowToControlOut(await this.requireGraph(workflow.id));
  }

  private async publishAbort(
    workflowId: string,
    applicationId: string,
    reason: 'pause' | 'cancel',
  ): Promise<void> {
    try {
      await this.workflowBus.publish({
        routingKey: WORKFLOW_ROUTING_KEYS.ABORT,
        message: {
          correlationId: randomUUID(),
          payload: { workflowId, applicationId, reason },
        },
      });
    } catch (err) {
      this.logger.warn(
        `workflow_bus_abort_publish_failed workflowId=${workflowId} detail=${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  /**
   * Resume/retry schedule nudge (DEC-021 / TASK-014): wake worker via
   * enveloped `workflow.schedule` after durable nextRunAt=now.
   */
  private async publishScheduleNudge(
    workflowId: string,
    applicationId: string,
  ): Promise<void> {
    try {
      await this.workflowBus.publish({
        routingKey: WORKFLOW_ROUTING_KEYS.SCHEDULE,
        message: {
          correlationId: randomUUID(),
          payload: {
            workflowId,
            applicationId,
            scheduledAt: new Date().toISOString(),
          },
        },
      });
    } catch (err) {
      this.logger.warn(
        `workflow_bus_schedule_nudge_publish_failed workflowId=${workflowId} detail=${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  async load(workflowId: string): Promise<BlsWorkflowGraph | null> {
    return this.workflows.loadGraph(workflowId);
  }

  async loadActiveForApplication(
    applicationId: string,
  ): Promise<BlsWorkflowGraph | null> {
    const active =
      await this.workflows.findActiveByApplicationId(applicationId);
    if (!active) {
      return null;
    }
    return this.workflows.loadGraph(active.id);
  }

  async loadLatestForApplication(
    applicationId: string,
  ): Promise<BlsWorkflowGraph | null> {
    const latest =
      await this.workflows.findLatestByApplicationId(applicationId);
    if (!latest) {
      return null;
    }
    return this.workflows.loadGraph(latest.id);
  }

  /**
   * Mark task COMPLETED only when `verifiedExternalState` is true, then advance cursor.
   * BOOK full completion → workflow AWAITING_STAFF_BOOKING (DEC-010 / DEC-004 /
   * OQ-007). Terminal mailbox cleanup runs here only — not on mid-booking
   * SAFE_TO_REPEAT slots retries or WAITING_STAFF staff gates.
   */
  async advance(input: AdvanceBlsWorkflowInput): Promise<BlsWorkflowGraph> {
    try {
      assertBlsCompleteVerified({
        verifiedExternalState: input.verifiedExternalState,
      });
    } catch {
      throw new HttpException(
        BLS_WORKFLOW_MSG_COMPLETE_WITHOUT_VERIFY,
        HttpStatus.BAD_REQUEST,
      );
    }

    const graph = await this.requireGraph(input.workflowId);
    this.assertNotTerminal(graph.workflow.status);

    const task = graph.tasks.find((t) => t.id === input.taskId);
    if (!task) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_TASK_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const now = new Date();
    task.status = BLS_WORKFLOW_TASK_STATUS.COMPLETED;
    task.lastErrorClass = null;
    task.lastErrorCode = null;
    task.lastErrorMessage = null;
    task.nextRunAt = null;
    await this.workflows.saveTask(task);

    const plan = planBlsWorkflowAdvance({
      steps: graph.steps,
      tasks: graph.tasks.map((t) =>
        t.id === task.id
          ? { ...t, status: BLS_WORKFLOW_TASK_STATUS.COMPLETED }
          : t,
      ),
      completedTaskId: task.id,
    });

    if (plan.completedStepId) {
      const step = graph.steps.find((s) => s.id === plan.completedStepId);
      if (step) {
        step.status = BLS_WORKFLOW_STEP_STATUS.COMPLETED;
        step.completedAt = now;
        await this.workflows.saveStep(step);
      }
    }

    const workflow = graph.workflow;
    workflow.updatedAt = now;

    const taskStep = graph.steps.find((s) => s.id === task.stepId);
    const completedStep = plan.completedStepId
      ? graph.steps.find((s) => s.id === plan.completedStepId)
      : undefined;

    await this.appendEvent({
      workflowId: workflow.id,
      eventType: BLS_WORKFLOW_EVENT_TYPE.TASK_COMPLETED,
      stepKey: taskStep?.stepKey ?? null,
      taskKey: task.taskKey,
      payloadSafe: { taskId: task.id },
    });

    if (completedStep) {
      await this.appendEvent({
        workflowId: workflow.id,
        eventType: BLS_WORKFLOW_EVENT_TYPE.STEP_COMPLETED,
        stepKey: completedStep.stepKey,
        taskKey: task.taskKey,
        payloadSafe: { stepId: completedStep.id },
      });
    }

    if (plan.bookSuccessTerminal) {
      workflow.status = BLS_WORKFLOW_STATUS.AWAITING_STAFF_BOOKING;
      workflow.terminalReason = null;
      workflow.nextRunAt = null;
      workflow.currentStepKey = plan.nextStepKey;
      workflow.currentTaskKey = plan.nextTaskKey;
      workflow.lockOwner = null;
      workflow.lockHeartbeatAt = null;
      await this.workflows.saveWorkflow(workflow);
      await this.appendEvent({
        workflowId: workflow.id,
        eventType: BLS_WORKFLOW_EVENT_TYPE.AWAITING_STAFF_BOOKING,
        stepKey: completedStep?.stepKey ?? null,
        taskKey: task.taskKey,
        payloadSafe: { status: BLS_WORKFLOW_STATUS.AWAITING_STAFF_BOOKING },
      });
      await this.terminalCleanup.cleanupAfterTerminal({
        workflowId: workflow.id,
      });
      return this.requireGraph(workflow.id);
    }

    if (plan.nextTaskId) {
      const nextTask = graph.tasks.find((t) => t.id === plan.nextTaskId);
      if (nextTask) {
        nextTask.status = BLS_WORKFLOW_TASK_STATUS.READY;
        await this.workflows.saveTask(nextTask);
      }
      const nextStep = graph.steps.find((s) => s.stepKey === plan.nextStepKey);
      if (
        nextStep &&
        nextStep.status === BLS_WORKFLOW_STEP_STATUS.PENDING
      ) {
        nextStep.status = BLS_WORKFLOW_STEP_STATUS.READY;
        await this.workflows.saveStep(nextStep);
      }
      workflow.currentStepKey = plan.nextStepKey;
      workflow.currentTaskKey = plan.nextTaskKey;
    }

    // DEC-006: non-runnable (PAUSED / CANCELLED / terminals) wins over stale RUNNING.
    const latestForAdvance = await this.workflows.findById(workflow.id);
    if (
      latestForAdvance &&
      isBlsWorkflowStatusNonRunnable(latestForAdvance.status)
    ) {
      workflow.status = latestForAdvance.status;
      workflow.nextRunAt = null;
    } else if (
      plan.nextTaskId &&
      workflow.status === BLS_WORKFLOW_STATUS.PENDING
    ) {
      workflow.status = BLS_WORKFLOW_STATUS.RUNNING;
      await this.appendEvent({
        workflowId: workflow.id,
        eventType: BLS_WORKFLOW_EVENT_TYPE.WORKFLOW_STATUS_CHANGED,
        stepKey: plan.nextStepKey,
        taskKey: plan.nextTaskKey,
        payloadSafe: { status: BLS_WORKFLOW_STATUS.RUNNING },
      });
    }

    await this.workflows.saveWorkflow(workflow);
    return this.requireGraph(workflow.id);
  }

  /**
   * Skip PASSWORD_CHANGE (or other skippable) with reason; advance to next step.
   */
  async skip(input: SkipBlsWorkflowStepInput): Promise<BlsWorkflowGraph> {
    if (!isBlsWorkflowStepSkippable(input.stepKey)) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_STEP_NOT_SKIPPABLE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const graph = await this.requireGraph(input.workflowId);
    this.assertNotTerminal(graph.workflow.status);

    const step = graph.steps.find((s) => s.stepKey === input.stepKey);
    if (!step) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_STEP_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const now = new Date();
    step.status = BLS_WORKFLOW_STEP_STATUS.SKIPPED;
    step.skipReason = input.reason;
    step.completedAt = now;
    await this.workflows.saveStep(step);

    const stepTasks = graph.tasks.filter((t) => t.stepId === step.id);
    for (const task of stepTasks) {
      task.status = BLS_WORKFLOW_TASK_STATUS.SKIPPED;
      await this.workflows.saveTask(task);
    }

    const tasksAfterSkip = graph.tasks.map((t) =>
      stepTasks.some((st) => st.id === t.id)
        ? { ...t, status: BLS_WORKFLOW_TASK_STATUS.SKIPPED }
        : t,
    );

    const next = findNextBlsWorkflowOpenTask({
      steps: graph.steps,
      tasks: tasksAfterSkip,
      afterStepOrdinal: step.ordinal,
    });

    const workflow = graph.workflow;
    workflow.updatedAt = now;

    if (next) {
      const nextTask = graph.tasks.find((t) => t.id === next.taskId);
      if (nextTask) {
        nextTask.status = BLS_WORKFLOW_TASK_STATUS.READY;
        await this.workflows.saveTask(nextTask);
      }
      const nextStepEntity = graph.steps.find((s) => s.id === next.stepId);
      if (
        nextStepEntity &&
        nextStepEntity.status === BLS_WORKFLOW_STEP_STATUS.PENDING
      ) {
        nextStepEntity.status = BLS_WORKFLOW_STEP_STATUS.READY;
        await this.workflows.saveStep(nextStepEntity);
      }
      workflow.currentStepKey = next.stepKey;
      workflow.currentTaskKey = next.taskKey;
      if (workflow.status === BLS_WORKFLOW_STATUS.PENDING) {
        workflow.status = BLS_WORKFLOW_STATUS.RUNNING;
      }
    }

    await this.workflows.saveWorkflow(workflow);

    await this.appendEvent({
      workflowId: workflow.id,
      eventType: BLS_WORKFLOW_EVENT_TYPE.STEP_SKIPPED,
      stepKey: step.stepKey,
      taskKey: null,
      payloadSafe: { reason: input.reason },
    });

    return this.requireGraph(workflow.id);
  }

  /**
   * Fail a task; optionally terminalize workflow as FAILED.
   */
  async fail(input: FailBlsWorkflowTaskInput): Promise<BlsWorkflowGraph> {
    const graph = await this.requireGraph(input.workflowId);
    this.assertNotTerminal(graph.workflow.status);

    const task = graph.tasks.find((t) => t.id === input.taskId);
    if (!task) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_TASK_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const now = new Date();
    task.status = BLS_WORKFLOW_TASK_STATUS.FAILED;
    task.lastErrorClass = input.errorClass;
    task.lastErrorCode = input.errorCode ?? null;
    task.lastErrorMessage = input.errorMessage ?? null;
    await this.workflows.saveTask(task);

    const step = graph.steps.find((s) => s.id === task.stepId);
    const terminalWorkflow = input.terminalWorkflow !== false;

    await this.appendEvent({
      workflowId: input.workflowId,
      eventType: BLS_WORKFLOW_EVENT_TYPE.TASK_FAILED,
      stepKey: step?.stepKey ?? null,
      taskKey: task.taskKey,
      payloadSafe: {
        taskId: task.id,
        errorClass: input.errorClass,
        errorCode: input.errorCode ?? null,
        errorMessage: input.errorMessage ?? null,
        terminalWorkflow,
      },
    });

    if (terminalWorkflow) {
      if (step) {
        step.status = BLS_WORKFLOW_STEP_STATUS.FAILED;
        step.completedAt = now;
        await this.workflows.saveStep(step);
      }
      const workflow = graph.workflow;
      workflow.status = BLS_WORKFLOW_STATUS.FAILED;
      workflow.terminalReason =
        input.errorMessage ?? input.errorCode ?? input.errorClass;
      workflow.nextRunAt = null;
      workflow.lockOwner = null;
      workflow.lockHeartbeatAt = null;
      workflow.updatedAt = now;
      await this.workflows.saveWorkflow(workflow);
      await this.appendEvent({
        workflowId: workflow.id,
        eventType: BLS_WORKFLOW_EVENT_TYPE.WORKFLOW_STATUS_CHANGED,
        stepKey: step?.stepKey ?? null,
        taskKey: task.taskKey,
        payloadSafe: { status: BLS_WORKFLOW_STATUS.FAILED },
      });
      await this.terminalCleanup.cleanupAfterTerminal({
        workflowId: workflow.id,
      });
    } else {
      const workflow = graph.workflow;
      // DEC-006: non-terminal fail must not clobber PAUSED / CANCELLED / terminals.
      const latestForFail = await this.workflows.findById(workflow.id);
      if (
        latestForFail &&
        isBlsWorkflowStatusNonRunnable(latestForFail.status)
      ) {
        workflow.status = latestForFail.status;
        workflow.nextRunAt = null;
        workflow.updatedAt = now;
        await this.workflows.saveWorkflow(workflow);
      } else {
        workflow.status = BLS_WORKFLOW_STATUS.WAITING_STAFF;
        workflow.updatedAt = now;
        await this.workflows.saveWorkflow(workflow);
        await this.appendEvent({
          workflowId: workflow.id,
          eventType: BLS_WORKFLOW_EVENT_TYPE.WORKFLOW_STATUS_CHANGED,
          stepKey: step?.stepKey ?? null,
          taskKey: task.taskKey,
          payloadSafe: { status: BLS_WORKFLOW_STATUS.WAITING_STAFF },
        });
      }
    }

    return this.requireGraph(input.workflowId);
  }

  /** Mark workflow ABANDONED (supersede / staff abandon); terminal cleanup + abort (DEC-004). */
  async abandon(input: AbandonBlsWorkflowInput): Promise<BlsWorkflowGraph> {
    const graph = await this.requireGraph(input.workflowId);
    if (graph.workflow.status === BLS_WORKFLOW_STATUS.ABANDONED) {
      this.abortRegistry.requestAbort(graph.workflow.id);
      return graph;
    }

    const now = new Date();
    const workflow = graph.workflow;
    workflow.status = BLS_WORKFLOW_STATUS.ABANDONED;
    workflow.terminalReason = input.reason ?? BLS_WORKFLOW_MSG_SUPERSEDED;
    workflow.nextRunAt = null;
    workflow.lockOwner = null;
    workflow.lockHeartbeatAt = null;
    workflow.updatedAt = now;
    await this.workflows.saveWorkflow(workflow);
    await this.clearCurrentTaskNextRunAt(graph);
    await this.appendEvent({
      workflowId: workflow.id,
      eventType: BLS_WORKFLOW_EVENT_TYPE.WORKFLOW_ABANDONED,
      stepKey: workflow.currentStepKey,
      taskKey: workflow.currentTaskKey,
      payloadSafe: { reason: workflow.terminalReason },
    });
    await this.terminalCleanup.cleanupAfterTerminal({ workflowId: workflow.id });
    this.abortRegistry.requestAbort(workflow.id);
    return this.requireGraph(workflow.id);
  }

  /** Clear pending auto-retry schedule on the current open task (SUB-003). */
  private async clearCurrentTaskNextRunAt(
    graph: BlsWorkflowGraph,
  ): Promise<void> {
    const current = findCurrentBlsWorkflowReadyTask({
      steps: graph.steps,
      tasks: graph.tasks,
    });
    if (!current) {
      return;
    }
    const task = graph.tasks.find((t) => t.id === current.taskId);
    if (!task || task.nextRunAt == null) {
      return;
    }
    task.nextRunAt = null;
    await this.workflows.saveTask(task);
  }

  private async requireGraph(workflowId: string): Promise<BlsWorkflowGraph> {
    const graph = await this.workflows.loadGraph(workflowId);
    if (!graph) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return graph;
  }

  private async requireGraphForApplication(
    applicationId: string,
    workflowId: string,
  ): Promise<BlsWorkflowGraph> {
    const graph = await this.requireGraph(workflowId);
    if (graph.workflow.applicationId !== applicationId) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return graph;
  }

  /**
   * Shared Completeness + date start-gate for create / retry / resume (DEC-001).
   * On fail: Should set «Нужны правки», then HTTP 400 with aggregated Russian detail.
   */
  private async enforceStartGateOrThrow(app: Application): Promise<void> {
    const gate = evaluateBlsWorkflowStartGate({
      applicants: [],
      clientEmail: app.clientEmail,
      returnDate: app.returnDate,
    });
    if (gate.ok) {
      return;
    }
    if (applyApplicationNeedsFixesStatus(app)) {
      await this.appRepo.save(app);
    }
    throw new HttpException(gate.detail, HttpStatus.BAD_REQUEST);
  }

  private assertNotTerminal(status: string): void {
    if (isBlsWorkflowStatusTerminal(status)) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_TERMINAL,
        HttpStatus.CONFLICT,
      );
    }
  }

  /** Live non-stale lock blocks staff retry/resume (REQ-005 / 409). */
  private assertNoLiveLock(graph: BlsWorkflowGraph): void {
    const live = hasBlsWorkflowLiveNonStaleLock({
      lockOwner: graph.workflow.lockOwner,
      lockHeartbeatAt: graph.workflow.lockHeartbeatAt,
      nowMs: Date.now(),
    });
    if (live) {
      throw new HttpException(
        BLS_WORKFLOW_MSG_LIVE_LOCK,
        HttpStatus.CONFLICT,
      );
    }
  }
}
