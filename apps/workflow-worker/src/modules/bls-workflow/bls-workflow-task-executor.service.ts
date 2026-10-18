import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  BLS_BOOKING_CLIENT,
  BLS_LOGIN_CLIENT,
  BLS_PASSWORD_CHANGE_CLIENT,
  BLS_REGISTER_CLIENT,
  BLS_STATUS_CLIENT,
} from '../bls-clients/constants/bls-clients-di.tokens';
import {
  BLS_CLIENT_UNKNOWN_TASK_ERROR_CODE,
  BLS_CLIENT_UNKNOWN_TASK_ERROR_MESSAGE,
} from '../bls-clients/constants/bls-clients.constants';
import type { BlsBookingClient } from '../bls-clients/interfaces/bls-booking-client.interface';
import type { BlsLoginClient } from '../bls-clients/interfaces/bls-login-client.interface';
import type { BlsPasswordChangeClient } from '../bls-clients/interfaces/bls-password-change-client.interface';
import type { BlsRegisterClient } from '../bls-clients/interfaces/bls-register-client.interface';
import type { BlsStatusClient } from '../bls-clients/interfaces/bls-status-client.interface';
import type { BlsClientResult } from '../bls-clients/types/bls-client-result.types';
import type { BlsClientTaskContext } from '../bls-clients/types/bls-client-context.types';
import { resolveBlsDomainClientKind } from '../bls-clients/utils/resolve-bls-domain-client-kind.util';
import {
  BLS_WORKFLOW_ERROR_CLASS,
  BLS_WORKFLOW_EVENT_TYPE,
  BLS_WORKFLOW_STEP_KEY,
} from './constants/bls-workflow.constants';
import type { IBlsWorkflowTaskExecutor } from './interfaces/bls-workflow-task-executor.interface';
import type {
  BlsWorkflowTaskExecutorInput,
  BlsWorkflowTaskExecutorResult,
} from './types/bls-workflow-runner.types';
import type { BlsWorkflowStepKey } from './types/bls-workflow.types';
import { isBlsWorkflowStepSkippable } from './utils/is-bls-workflow-step-skippable.util';
import { BlsWorkflowAbortRegistry } from './bls-workflow-abort.registry';
import { BlsWorkflowService } from './bls-workflow.service';

/**
 * Thin dispatcher: maps step/task keys onto domain BLS clients (DEC-008).
 * Runner injects only IBlsWorkflowTaskExecutor — never concrete clients.
 * REGISTER / LOGIN / PASSWORD_CHANGE / STATUS / BOOK live (CON-006 safe stop).
 * Lives in bls-workflow so Nest edge is workflow → clients only (DEC-004).
 */
@Injectable()
export class BlsWorkflowTaskExecutor implements IBlsWorkflowTaskExecutor {
  private readonly logger = new Logger(BlsWorkflowTaskExecutor.name);

  constructor(
    @Inject(BLS_REGISTER_CLIENT)
    private readonly registerClient: BlsRegisterClient,
    @Inject(BLS_LOGIN_CLIENT)
    private readonly loginClient: BlsLoginClient,
    @Inject(BLS_PASSWORD_CHANGE_CLIENT)
    private readonly passwordChangeClient: BlsPasswordChangeClient,
    @Inject(BLS_STATUS_CLIENT)
    private readonly statusClient: BlsStatusClient,
    @Inject(BLS_BOOKING_CLIENT)
    private readonly bookingClient: BlsBookingClient,
    private readonly workflowService: BlsWorkflowService,
    private readonly abortRegistry: BlsWorkflowAbortRegistry,
  ) {}

  async execute(
    input: BlsWorkflowTaskExecutorInput,
  ): Promise<BlsWorkflowTaskExecutorResult> {
    const kind = resolveBlsDomainClientKind({
      stepKey: input.stepKey,
      taskKey: input.taskKey,
    });

    this.logger.log(
      `bls_workflow_task_executor workflowId=${input.workflowId} stepKey=${input.stepKey} taskKey=${input.taskKey} kind=${kind ?? 'unknown'} attemptNo=${input.attemptNo}`,
    );

    if (kind === null) {
      return {
        ok: false,
        errorClass: BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT,
        errorCode: BLS_CLIENT_UNKNOWN_TASK_ERROR_CODE,
        errorMessage: BLS_CLIENT_UNKNOWN_TASK_ERROR_MESSAGE,
      };
    }

    const context = this.toClientContext(input);

    switch (kind) {
      case 'register': {
        const result = await this.registerClient.execute(context);
        await this.appendAutofillRunLinkedIfPresent(input, result);
        return this.toExecutorResult(result);
      }
      case 'login':
        return this.toExecutorResult(await this.loginClient.execute(context));
      case 'password_change': {
        const result = await this.passwordChangeClient.execute(context);
        if (result.ok === false && result.skipped === true) {
          const stepKey = this.resolveSkippableStepKey(input.stepKey);
          if (stepKey) {
            await this.workflowService.skip({
              workflowId: input.workflowId,
              stepKey,
              reason: result.skipReason,
            });
            this.logger.log(
              `bls_workflow_task_executor skipped stepKey=${stepKey} workflowId=${input.workflowId}`,
            );
          }
        }
        return this.toExecutorResult(result);
      }
      case 'status':
        return this.toExecutorResult(await this.statusClient.execute(context));
      case 'booking':
        return this.toExecutorResult(await this.bookingClient.execute(context));
    }
  }

  /**
   * Enrich executor input with registry close-hook callback so clients never
   * import BlsWorkflowAbortRegistry (cycle break / DEC-001).
   */
  private toClientContext(
    input: BlsWorkflowTaskExecutorInput,
  ): BlsClientTaskContext {
    return {
      workflowId: input.workflowId,
      applicationId: input.applicationId,
      stepId: input.stepId,
      stepKey: input.stepKey,
      taskId: input.taskId,
      taskKey: input.taskKey,
      applicantId: input.applicantId,
      attemptNo: input.attemptNo,
      abortSignal: input.abortSignal,
      registerCloseHook: (close) =>
        this.abortRegistry.registerCloseHook(input.workflowId, close),
    };
  }

  private async appendAutofillRunLinkedIfPresent(
    input: BlsWorkflowTaskExecutorInput,
    result: BlsClientResult,
  ): Promise<void> {
    const linked = result.autofillRunLinked;
    if (!linked) {
      return;
    }
    await this.workflowService
      .appendEvent({
        workflowId: input.workflowId,
        eventType: BLS_WORKFLOW_EVENT_TYPE.AUTOFILL_RUN_LINKED,
        stepKey: BLS_WORKFLOW_STEP_KEY.REGISTER,
        taskKey: input.taskKey,
        payloadSafe: {
          runId: linked.runId,
          stepId: linked.stepId,
          created: linked.created,
        },
      })
      .catch((err) => {
        const detail = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `bls_workflow_task_executor autofill_run_linked_event skipped ${detail}`,
        );
      });
  }

  /** Strip client-only metadata before returning to the runner. */
  private toExecutorResult(
    result: BlsClientResult,
  ): BlsWorkflowTaskExecutorResult {
    if (result.ok === true) {
      return {
        ok: true,
        verifiedExternalState: true,
      };
    }
    if (result.skipped === true) {
      return {
        ok: false,
        skipped: true,
        skipReason: result.skipReason,
      };
    }
    return {
      ok: false,
      errorClass: result.errorClass,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      evidenceRelativePath: result.evidenceRelativePath,
    };
  }

  private resolveSkippableStepKey(
    stepKey: string,
  ): BlsWorkflowStepKey | null {
    if (
      stepKey === BLS_WORKFLOW_STEP_KEY.PASSWORD_CHANGE &&
      isBlsWorkflowStepSkippable(stepKey)
    ) {
      return BLS_WORKFLOW_STEP_KEY.PASSWORD_CHANGE;
    }
    return null;
  }
}
