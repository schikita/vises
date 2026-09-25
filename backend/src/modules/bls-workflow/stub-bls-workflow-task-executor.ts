import { Injectable, Logger } from '@nestjs/common';
import {
  BLS_WORKFLOW_ERROR_CLASS,
  BLS_WORKFLOW_EXECUTOR_STUB_ERROR_CODE,
  BLS_WORKFLOW_EXECUTOR_STUB_ERROR_MESSAGE,
} from './constants/bls-workflow.constants';
import type { IBlsWorkflowTaskExecutor } from './interfaces/bls-workflow-task-executor.interface';
import type {
  BlsWorkflowTaskExecutorInput,
  BlsWorkflowTaskExecutorResult,
} from './types/bls-workflow-runner.types';

/**
 * Legacy placeholder executor (TASK-004).
 * Superseded by `BlsWorkflowTaskExecutor` dispatcher in `bls-workflow/` (DEC-004).
 * Kept for reference / optional unit doubles — not wired in BlsWorkflowModule.
 */
@Injectable()
export class StubBlsWorkflowTaskExecutor implements IBlsWorkflowTaskExecutor {
  private readonly logger = new Logger(StubBlsWorkflowTaskExecutor.name);

  async execute(
    input: BlsWorkflowTaskExecutorInput,
  ): Promise<BlsWorkflowTaskExecutorResult> {
    this.logger.log(
      `bls_workflow_executor_stub workflowId=${input.workflowId} taskKey=${input.taskKey} attemptNo=${input.attemptNo}`,
    );
    return {
      ok: false,
      errorClass: BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT,
      errorCode: BLS_WORKFLOW_EXECUTOR_STUB_ERROR_CODE,
      errorMessage: BLS_WORKFLOW_EXECUTOR_STUB_ERROR_MESSAGE,
    };
  }
}
