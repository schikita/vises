import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  BLS_WORKFLOW_ATTEMPT_OUTCOME,
  BLS_WORKFLOW_ERROR_CLASS,
  BLS_WORKFLOW_LOCK_HEARTBEAT_MS,
  BLS_WORKFLOW_RUNNER_TICK_MS,
  BLS_WORKFLOW_STATUS,
  BLS_WORKFLOW_STEP_STATUS,
  BLS_WORKFLOW_TASK_STATUS,
  BLS_WORKFLOW_TASK_EXECUTOR,
} from '../constants';
import type { IBlsWorkflowTaskExecutor } from '../interfaces/bls-workflow-task-executor.interface';
import type { BlsWorkflowTaskExecutorResult } from '../types/bls-workflow-runner.types';
import { computeBlsWorkflowNextRunAt } from '../utils/compute-bls-workflow-next-run-at.util';
import { findCurrentBlsWorkflowReadyTask } from '../utils/find-current-bls-workflow-ready-task.util';
import { isBlsWorkflowErrorClassAutoRetryable } from '../utils/is-bls-workflow-error-class-auto-retryable.util';
import { isBlsWorkflowErrorClassNotSafeToRepeat } from '../utils/is-bls-workflow-error-class-not-safe-to-repeat.util';
import { isBlsWorkflowStatusTerminal } from '../utils/is-bls-workflow-status-terminal.util';
import { isBlsWorkflowTaskExecutorSkipped } from '../utils/is-bls-workflow-task-executor-skipped.util';
import { BlsWorkflowLockService } from './bls-workflow-lock.service';
import { BlsWorkflowRepository } from './bls-workflow.repository';
import { BlsWorkflowService } from './bls-workflow.service';
import { BlsWorkflowTerminalCleanupService } from '../bls-workflow-terminal-cleanup.service';

/**
 * Nest in-process DB-backed workflow runner (DEC-002 / DEC-014 / DEC-018).
 * Polls due workflows via claimDueWorkflow; executes one task per claim;
 * classifies failures and schedules exponential backoff (cap 5 min, max 5 attempts).
 * Optional events TTL purge tick (DEC-020 / TASK-018). No Bull/Redis/cron. Never logs secrets.
 */
@Injectable()
export class BlsWorkflowRunner implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlsWorkflowRunner.name);
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private tickInFlight = false;

  constructor(
    private readonly lockService: BlsWorkflowLockService,
    private readonly workflows: BlsWorkflowRepository,
    private readonly workflowService: BlsWorkflowService,
    private readonly terminalCleanup: BlsWorkflowTerminalCleanupService,
    @Inject(BLS_WORKFLOW_TASK_EXECUTOR)
    private readonly executor: IBlsWorkflowTaskExecutor,
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
      await this.runOnce();
      await this.terminalCleanup.purgeExpiredEvents();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`bls_workflow_runner_tick_error message=${message}`);
    } finally {
      this.tickInFlight = false;
    }
  }

  private async runOnce(): Promise<void> {
    const lease = await this.lockService.claimDueWorkflow();
    if (!lease) {
      return;
    }

    const { workflow, lockOwner } = lease;
    const workflowId = workflow.id;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

    try {
      const graph = await this.workflows.loadGraph(workflowId);
      if (!graph || isBlsWorkflowStatusTerminal(graph.workflow.status)) {
        return;
      }

      const current = findCurrentBlsWorkflowReadyTask({
        steps: graph.steps,
        tasks: graph.tasks,
      });
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
      }, BLS_WORKFLOW_LOCK_HEARTBEAT_MS);

      this.logger.log(
        `bls_workflow_runner_execute workflowId=${workflowId} taskKey=${current.taskKey} attemptNo=${attemptNo}`,
      );

      const startedAt = new Date();
      let result: BlsWorkflowTaskExecutorResult;
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
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        result = {
          ok: false,
          errorClass: BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT,
          errorCode: 'executor_throw',
          errorMessage: message.slice(0, 500),
        };
      }
      const finishedAt = new Date();

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

      // PASSWORD_CHANGE not presented: dispatcher already called skip (REQ-012).
      if (isBlsWorkflowTaskExecutorSkipped(result)) {
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
      if (heartbeatTimer != null) {
        clearInterval(heartbeatTimer);
      }
      await this.lockService
        .releaseLock({ workflowId, lockOwner })
        .catch(() => undefined);
    }
  }

  private async scheduleImmediateNextRun(workflowId: string): Promise<void> {
    const after = await this.workflows.loadGraph(workflowId);
    if (
      after &&
      !isBlsWorkflowStatusTerminal(after.workflow.status) &&
      after.workflow.status !== BLS_WORKFLOW_STATUS.WAITING_STAFF &&
      after.workflow.status !== BLS_WORKFLOW_STATUS.PAUSED
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
    const notSafe = isBlsWorkflowErrorClassNotSafeToRepeat(input.errorClass);
    const autoRetryable = isBlsWorkflowErrorClassAutoRetryable(input.errorClass);
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
    const nextRunAt = computeBlsWorkflowNextRunAt({
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
