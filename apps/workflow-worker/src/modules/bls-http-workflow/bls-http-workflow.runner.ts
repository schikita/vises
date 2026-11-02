import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  BLS_WORKFLOW_ABORT_ERROR_CODE,
  BLS_WORKFLOW_ABORT_ERROR_MESSAGE,
  BLS_WORKFLOW_ATTEMPT_OUTCOME,
  BLS_WORKFLOW_ERROR_CLASS,
  BLS_WORKFLOW_LOCK_HEARTBEAT_MS,
  BLS_WORKFLOW_RUNNER_TICK_MS,
  BLS_WORKFLOW_STATUS,
  BLS_WORKFLOW_STEP_STATUS,
  BLS_WORKFLOW_TASK_STATUS,
} from './constants/bls-http-workflow.constants';
import { BLS_HTTP_WORKFLOW_RUNNER_TICK_TIMEOUT_MS } from './constants/bls-http-workflow.constants';
import { BLS_HTTP_WORKFLOW_TASK_EXECUTOR } from './constants/bls-http-workflow-di.tokens';
import type { IBlsHttpWorkflowTaskExecutor } from './interfaces/bls-http-workflow-task-executor.interface';
import type { BlsHttpWorkflowTaskExecutorResult } from './types/bls-http-workflow-runner.types';
import { computeBlsHttpWorkflowNextRunAt } from './utils/compute-bls-http-workflow-next-run-at.util';
import { findCurrentBlsHttpWorkflowReadyTask } from './utils/find-current-bls-http-workflow-ready-task.util';
import { isBlsHttpWorkflowAbortResult } from './utils/is-bls-http-workflow-abort-result.util';
import { isBlsHttpWorkflowErrorClassAutoRetryable } from './utils/is-bls-http-workflow-error-class-auto-retryable.util';
import { isBlsHttpWorkflowErrorClassNotSafeToRepeat } from './utils/is-bls-http-workflow-error-class-not-safe-to-repeat.util';
import { isBlsHttpWorkflowStatusNonRunnable } from './utils/is-bls-http-workflow-status-non-runnable.util';
import { isBlsHttpWorkflowTaskExecutorSkipped } from './utils/is-bls-http-workflow-task-executor-skipped.util';
import { BlsHttpWorkflowAbortRegistry } from './bls-http-workflow-abort.registry';
import { BlsHttpWorkflowLockService } from './bls-http-workflow-lock.service';
import { BlsHttpWorkflowRepository } from './bls-http-workflow.repository';
import { BlsHttpWorkflowService } from './bls-http-workflow.service';
import { BlsHttpWorkflowTerminalCleanupService } from './bls-http-workflow-terminal-cleanup.service';

/**
 * Nest in-process DB-backed workflow runner (DEC-002 / DEC-014 / DEC-018).
 * Polls due workflows via claimDueWorkflow; executes one task per claim;
 * classifies failures and schedules exponential backoff (cap 5 min, max 5 attempts).
 * Optional events TTL + due temporary email cleanup ticks (DEC-020 / portal-credential-reveal DEC-004).
 * Non-runnable status gates (PAUSED ∪ terminals) before execute / retry (immediate-stop DEC-006).
 * Mid-flight abort → ABORTED attempt, no auto-retry (DEC-001 / DEC-003).
 * Heartbeat-aligned DB status watch for cross-process pause/cancel (DEC-008 / CON-005).
 * Attempt claim gated by browser session budget (REQ-006 / DEC-012).
 * No Bull/Redis/cron. Never logs secrets.
 */
@Injectable()
export class BlsHttpWorkflowRunner implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlsHttpWorkflowRunner.name);
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private tickInFlight = false;
  private tickPhase = 'idle';
  /**
   * Own single-attempt guard. The HTTP engine launches no browsers, so it
   * must not share the browser session budget with the legacy patchright
   * engine: a stalled legacy runner tick would otherwise starve this engine
   * (and vice versa) via the shared per-worker cap.
   */
  private httpAttemptInFlight = false;

  constructor(
    private readonly lockService: BlsHttpWorkflowLockService,
    private readonly workflows: BlsHttpWorkflowRepository,
    private readonly workflowService: BlsHttpWorkflowService,
    private readonly terminalCleanup: BlsHttpWorkflowTerminalCleanupService,
    private readonly abortRegistry: BlsHttpWorkflowAbortRegistry,
    @Inject(BLS_HTTP_WORKFLOW_TASK_EXECUTOR)
    private readonly executor: IBlsHttpWorkflowTaskExecutor,
  ) {}

  onModuleInit(): void {
    this.tickTimer = setInterval(() => {
      void this.safeTick();
    }, BLS_WORKFLOW_RUNNER_TICK_MS);
    void this.safeTick();
    this.logger.log(
      `bls_workflow_runner_started tickMs=${BLS_WORKFLOW_RUNNER_TICK_MS}`,
    );
  }

  onModuleDestroy(): void {
    if (this.tickTimer != null) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  /** Public for tests / manual kick; guarded against overlapping ticks. */
  async tick(): Promise<void> {
    await this.safeTick();
  }

  private async safeTick(): Promise<void> {
    if (this.tickInFlight) {
      return;
    }
    this.tickInFlight = true;
    try {
      // Hard race around the whole tick body: a stalled DB-layer await (lost
      // pg result / leaked pooled connection) must degrade into a logged
      // timeout instead of silently freezing this runner while it holds the
      // shared per-worker attempt budget. The abandoned promise is left
      // dangling — pool/statement timeouts and the claim lock TTL clean up.
      const body = (async () => {
        await this.runOnce();
        await this.terminalCleanup.purgeExpiredEvents();
        await this.terminalCleanup.purgeDueMailboxes();
      })();
      const timer = new Promise<void>((resolve) => {
        setTimeout(resolve, BLS_HTTP_WORKFLOW_RUNNER_TICK_TIMEOUT_MS);
      });
      const winner = await Promise.race([body.then(() => 'ok'), timer.then(() => 'timeout')]);
      if (winner === 'timeout') {
        this.logger.error(
          `bls_workflow_runner_tick_timeout phase=${this.tickPhase} — forcing attempt slot loose (stalled DB await abandoned)`,
        );
        this.httpAttemptInFlight = false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`bls_workflow_runner_tick_error message=${message}`);
    } finally {
      this.tickInFlight = false;
    }
  }

  private async runOnce(): Promise<void> {
    // Defer claim when attempt/session budget is saturated (REQ-006 / DEC-012).
    if (this.httpAttemptInFlight) {
      return;
    }
    this.httpAttemptInFlight = true;

    this.tickPhase = 'claim';
    const lease = await this.lockService.claimDueWorkflow();
    if (!lease) {
      this.httpAttemptInFlight = false;
      return;
    }

    const { workflow, lockOwner } = lease;
    const workflowId = workflow.id;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let attemptBegun = false;

    try {
      const graph = await this.workflows.loadGraph(workflowId);
      if (!graph || isBlsHttpWorkflowStatusNonRunnable(graph.workflow.status)) {
        if (graph && isBlsHttpWorkflowStatusNonRunnable(graph.workflow.status)) {
          this.logger.log(
            `bls_workflow_runner_non_runnable_abort workflowId=${workflowId} status=${graph.workflow.status}`,
          );
        }
        return;
      }

      const current = findCurrentBlsHttpWorkflowReadyTask({
        steps: graph.steps,
        tasks: graph.tasks,
      });
      this.tickPhase = `execute:${current?.taskKey ?? 'none'}`;
      if (!current) {
        this.logger.log(
          `bls_workflow_runner_no_ready_task workflowId=${workflowId}`,
        );
        graph.workflow.nextRunAt = null;
        graph.workflow.updatedAt = new Date();
        await this.workflows.saveWorkflow(graph.workflow);
        return;
      }

      const task = graph.tasks.find((t) => t.id === current.taskId);
      if (!task) {
        return;
      }

      const step = graph.steps.find((s) => s.id === current.stepId);
      const now = new Date();
      const attemptNo = task.attemptCount + 1;

      // Re-read before forcing RUNNING so concurrent pause/cancel is not clobbered (DEC-006).
      const latestBeforeRun = await this.workflows.findById(workflowId);
      if (
        !latestBeforeRun ||
        isBlsHttpWorkflowStatusNonRunnable(latestBeforeRun.status)
      ) {
        this.logger.log(
          `bls_workflow_runner_non_runnable_abort workflowId=${workflowId} reason=pre_run_status status=${latestBeforeRun?.status ?? 'missing'}`,
        );
        return;
      }

      task.status = BLS_WORKFLOW_TASK_STATUS.RUNNING;
      task.attemptCount = attemptNo;
      await this.workflows.saveTask(task);

      if (step && step.status !== BLS_WORKFLOW_STEP_STATUS.RUNNING) {
        step.status = BLS_WORKFLOW_STEP_STATUS.RUNNING;
        if (step.startedAt == null) {
          step.startedAt = now;
        }
        await this.workflows.saveStep(step);
      }

      graph.workflow.status = BLS_WORKFLOW_STATUS.RUNNING;
      graph.workflow.currentStepKey = current.stepKey;
      graph.workflow.currentTaskKey = current.taskKey;
      graph.workflow.updatedAt = now;
      await this.workflows.saveWorkflow(graph.workflow);

      heartbeatTimer = setInterval(() => {
        void this.lockService
          .heartbeat({ workflowId, lockOwner })
          .catch(() => undefined);
        // Cross-process abort: DB SoT watch aligned with heartbeat (DEC-008 / CON-005).
        void this.watchAbortStatusFromDb(workflowId).catch(() => undefined);
      }, BLS_WORKFLOW_LOCK_HEARTBEAT_MS);

      this.logger.log(
        `bls_workflow_runner_execute workflowId=${workflowId} taskKey=${current.taskKey} attemptNo=${attemptNo}`,
      );

      const abortSignal = this.abortRegistry.beginAttempt(workflowId);
      attemptBegun = true;
      // Immediate DB watch in case pause/cancel landed before registry entry.
      await this.watchAbortStatusFromDb(workflowId);

      const startedAt = new Date();
      let result: BlsHttpWorkflowTaskExecutorResult;
      try {
        result = await this.executor.execute({
          workflowId,
          applicationId: graph.workflow.applicationId,
          stepId: current.stepId,
          stepKey: current.stepKey,
          taskId: current.taskId,
          taskKey: current.taskKey,
          applicantId: task.applicantId,
          attemptNo,
          abortSignal,
        });
      } catch (err) {
        if (abortSignal.aborted) {
          result = {
            ok: false,
            errorClass: BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT,
            errorCode: BLS_WORKFLOW_ABORT_ERROR_CODE,
            errorMessage: BLS_WORKFLOW_ABORT_ERROR_MESSAGE,
          };
        } else {
          const message = err instanceof Error ? err.message : String(err);
          result = {
            ok: false,
            errorClass: BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT,
            errorCode: 'executor_throw',
            errorMessage: message.slice(0, 500),
          };
        }
      }
      const finishedAt = new Date();
      this.tickPhase = 'bookkeeping';

      // DEC-003: mid-flight cancel/pause → ABORTED, never schedule_retry.
      if (abortSignal.aborted || isBlsHttpWorkflowAbortResult(result)) {
        await this.handleAborted({
          workflowId,
          taskId: task.id,
          attemptNo,
          startedAt,
          finishedAt,
        });
        return;
      }

      if (result.ok) {
        await this.lockService.recordAttempt({
          taskId: task.id,
          attemptNo,
          outcome: BLS_WORKFLOW_ATTEMPT_OUTCOME.SUCCEEDED,
          startedAt,
          finishedAt,
        });
        await this.workflowService.advance({
          workflowId,
          taskId: task.id,
          verifiedExternalState: result.verifiedExternalState,
        });
        await this.scheduleImmediateNextRun(workflowId);
        return;
      }

      // Skipped (PASSWORD_CHANGE not presented / REGISTER alreadyRegistered):
      // dispatcher already called workflowService.skip for the step.
      if (isBlsHttpWorkflowTaskExecutorSkipped(result)) {
        await this.lockService.recordAttempt({
          taskId: task.id,
          attemptNo,
          outcome: BLS_WORKFLOW_ATTEMPT_OUTCOME.SUCCEEDED,
          startedAt,
          finishedAt,
        });
        this.logger.log(
          `bls_workflow_runner_skipped workflowId=${workflowId} taskKey=${current.taskKey} reason=${result.skipReason}`,
        );
        await this.scheduleImmediateNextRun(workflowId);
        return;
      }

      await this.lockService.recordAttempt({
        taskId: task.id,
        attemptNo,
        outcome: BLS_WORKFLOW_ATTEMPT_OUTCOME.FAILED,
        errorClass: result.errorClass,
        errorCode: result.errorCode ?? null,
        errorMessage: result.errorMessage ?? null,
        evidenceRelativePath: result.evidenceRelativePath ?? null,
        startedAt,
        finishedAt,
      });

      await this.handleFailure({
        workflowId,
        taskId: task.id,
        attemptNo,
        maxAttempts: task.maxAttempts,
        errorClass: result.errorClass,
        errorCode: result.errorCode ?? null,
        errorMessage: result.errorMessage ?? null,
      });
    } finally {
      if (attemptBegun) {
        this.abortRegistry.endAttempt(workflowId);
      }
      if (heartbeatTimer != null) {
        clearInterval(heartbeatTimer);
      }
      this.tickPhase = 'release_lock';
      await this.lockService
        .releaseLock({ workflowId, lockOwner })
        .catch(() => undefined);
      this.tickPhase = 'attempt_end';
      this.httpAttemptInFlight = false;
    }
  }

  /**
   * Heartbeat-aligned DB SoT watch: pause/cancel/terminal stops in-flight
   * attempt even when Rabbit `workflow.abort` was missed (DEC-008 / CON-005).
   */
  private async watchAbortStatusFromDb(workflowId: string): Promise<void> {
    const latest = await this.workflows.findById(workflowId);
    if (!latest) {
      return;
    }
    if (!isBlsHttpWorkflowStatusNonRunnable(latest.status)) {
      return;
    }
    if (this.abortRegistry.isAbortRequested(workflowId)) {
      return;
    }
    this.logger.log(
      `bls_workflow_abort_db_watch workflowId=${workflowId} status=${latest.status}`,
    );
    this.abortRegistry.requestAbort(workflowId);
  }

  /**
   * Mid-flight abort persistence (DEC-003): attempt ABORTED, task WAITING,
   * nextRunAt null, preserve workflow PAUSED|CANCELLED|ABANDONED — no retry.
   */
  private async handleAborted(input: {
    workflowId: string;
    taskId: string;
    attemptNo: number;
    startedAt: Date;
    finishedAt: Date;
  }): Promise<void> {
    await this.lockService.recordAttempt({
      taskId: input.taskId,
      attemptNo: input.attemptNo,
      outcome: BLS_WORKFLOW_ATTEMPT_OUTCOME.ABORTED,
      errorCode: BLS_WORKFLOW_ABORT_ERROR_CODE,
      errorMessage: BLS_WORKFLOW_ABORT_ERROR_MESSAGE,
      startedAt: input.startedAt,
      finishedAt: input.finishedAt,
    });

    const graph = await this.workflows.loadGraph(input.workflowId);
    if (!graph) {
      return;
    }
    const task = graph.tasks.find((t) => t.id === input.taskId);
    if (!task) {
      return;
    }

    const now = new Date();
    const preservedStatus = graph.workflow.status;

    task.status = BLS_WORKFLOW_TASK_STATUS.WAITING;
    task.nextRunAt = null;
    task.lastErrorCode = BLS_WORKFLOW_ABORT_ERROR_CODE;
    task.lastErrorMessage = BLS_WORKFLOW_ABORT_ERROR_MESSAGE;
    await this.workflows.saveTask(task);

    graph.workflow.status = preservedStatus;
    graph.workflow.nextRunAt = null;
    graph.workflow.updatedAt = now;
    await this.workflows.saveWorkflow(graph.workflow);

    this.logger.log(
      `bls_workflow_runner_aborted workflowId=${input.workflowId} taskId=${input.taskId} attemptNo=${input.attemptNo} status=${preservedStatus}`,
    );
  }

  private async scheduleImmediateNextRun(workflowId: string): Promise<void> {
    const after = await this.workflows.loadGraph(workflowId);
    if (
      after &&
      !isBlsHttpWorkflowStatusNonRunnable(after.workflow.status) &&
      after.workflow.status !== BLS_WORKFLOW_STATUS.WAITING_STAFF
    ) {
      after.workflow.nextRunAt = new Date();
      after.workflow.updatedAt = new Date();
      await this.workflows.saveWorkflow(after.workflow);
    }
  }

  private async handleFailure(input: {
    workflowId: string;
    taskId: string;
    attemptNo: number;
    maxAttempts: number;
    errorClass: string;
    errorCode: string | null;
    errorMessage: string | null;
  }): Promise<void> {
    const notSafe = isBlsHttpWorkflowErrorClassNotSafeToRepeat(input.errorClass);
    const autoRetryable = isBlsHttpWorkflowErrorClassAutoRetryable(input.errorClass);
    const exhausted = input.attemptNo >= input.maxAttempts;

    if (notSafe || !autoRetryable || exhausted) {
      await this.workflowService.fail({
        workflowId: input.workflowId,
        taskId: input.taskId,
        errorClass: input.errorClass,
        errorCode: input.errorCode,
        errorMessage: input.errorMessage,
        terminalWorkflow: false,
      });
      this.logger.log(
        `bls_workflow_runner_staff_gate workflowId=${input.workflowId} taskId=${input.taskId} errorClass=${input.errorClass} attemptNo=${input.attemptNo}`,
      );
      return;
    }

    const graph = await this.workflows.loadGraph(input.workflowId);
    if (!graph) {
      return;
    }
    const task = graph.tasks.find((t) => t.id === input.taskId);
    if (!task) {
      return;
    }

    const now = new Date();

    // DEC-006: auto-retry must not overwrite PAUSED / CANCELLED / terminals with WAITING_RETRY.
    if (isBlsHttpWorkflowStatusNonRunnable(graph.workflow.status)) {
      const preservedStatus = graph.workflow.status;
      task.status = BLS_WORKFLOW_TASK_STATUS.WAITING;
      task.lastErrorClass = input.errorClass;
      task.lastErrorCode = input.errorCode;
      task.lastErrorMessage = input.errorMessage;
      task.nextRunAt = null;
      await this.workflows.saveTask(task);

      graph.workflow.status = preservedStatus;
      graph.workflow.nextRunAt = null;
      graph.workflow.updatedAt = now;
      await this.workflows.saveWorkflow(graph.workflow);

      this.logger.log(
        `bls_workflow_runner_non_runnable_skip_retry workflowId=${input.workflowId} taskId=${input.taskId} attemptNo=${input.attemptNo} status=${preservedStatus}`,
      );
      return;
    }

    const nextRunAt = computeBlsHttpWorkflowNextRunAt({
      attemptNo: input.attemptNo,
      now,
    });

    task.status = BLS_WORKFLOW_TASK_STATUS.WAITING;
    task.lastErrorClass = input.errorClass;
    task.lastErrorCode = input.errorCode;
    task.lastErrorMessage = input.errorMessage;
    task.nextRunAt = nextRunAt;
    await this.workflows.saveTask(task);

    graph.workflow.status = BLS_WORKFLOW_STATUS.WAITING_RETRY;
    graph.workflow.nextRunAt = nextRunAt;
    graph.workflow.updatedAt = now;
    await this.workflows.saveWorkflow(graph.workflow);

    this.logger.log(
      `bls_workflow_runner_schedule_retry workflowId=${input.workflowId} taskId=${input.taskId} attemptNo=${input.attemptNo} nextRunAt=${nextRunAt.toISOString()}`,
    );
  }
}
