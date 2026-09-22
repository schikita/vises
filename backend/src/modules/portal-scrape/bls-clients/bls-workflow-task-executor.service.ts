import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  BLS_WORKFLOW_ERROR_CLASS,
  BLS_WORKFLOW_STEP_KEY,
} from '../constants/bls-workflow.constants';
import type { IBlsWorkflowTaskExecutor } from '../interfaces/bls-workflow-task-executor.interface';
import type {
  BlsWorkflowTaskExecutorInput,
  BlsWorkflowTaskExecutorResult,
} from '../types/bls-workflow-runner.types';
import type { BlsWorkflowStepKey } from '../types/bls-workflow.types';
import { isBlsWorkflowStepSkippable } from '../utils/is-bls-workflow-step-skippable.util';
import { isBlsWorkflowTaskExecutorSkipped } from '../utils/is-bls-workflow-task-executor-skipped.util';
import { BlsWorkflowService } from '../workflow/bls-workflow.service';
import {
  BLS_BOOKING_CLIENT,
  BLS_CLIENT_UNKNOWN_TASK_ERROR_CODE,
  BLS_CLIENT_UNKNOWN_TASK_ERROR_MESSAGE,
  BLS_LOGIN_CLIENT,
  BLS_PASSWORD_CHANGE_CLIENT,
  BLS_REGISTER_CLIENT,
  BLS_STATUS_CLIENT,
} from './constants';
import type {
  BlsBookingClient,
  BlsLoginClient,
  BlsPasswordChangeClient,
  BlsRegisterClient,
  BlsStatusClient,
} from './interfaces';
import { resolveBlsDomainClientKind } from './utils';

/**
 * Thin dispatcher: maps step/task keys onto domain BLS clients (DEC-008).
 * Runner injects only IBlsWorkflowTaskExecutor — never concrete clients.
 * REGISTER / LOGIN / PASSWORD_CHANGE / STATUS / BOOK live (CON-006 safe stop).
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

    switch (kind) {
      case 'register':
        return this.registerClient.execute(input);
      case 'login':
        return this.loginClient.execute(input);
      case 'password_change': {
        const result = await this.passwordChangeClient.execute(input);
        if (isBlsWorkflowTaskExecutorSkipped(result)) {
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
        return result;
      }
      case 'status':
        return this.statusClient.execute(input);
      case 'booking':
        return this.bookingClient.execute(input);
    }
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
