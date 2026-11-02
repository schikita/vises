import { Injectable, Logger } from '@nestjs/common';
import {
  BLS_WORKFLOW_ERROR_CLASS,
  BLS_WORKFLOW_EXECUTOR_STUB_ERROR_CODE,
  BLS_WORKFLOW_EXECUTOR_STUB_ERROR_MESSAGE,
} from './constants/bls-http-workflow.constants';
import type { IBlsHttpWorkflowTaskExecutor } from './interfaces/bls-http-workflow-task-executor.interface';
import type {
  BlsHttpWorkflowTaskExecutorInput,
  BlsHttpWorkflowTaskExecutorResult,
} from './types/bls-http-workflow-runner.types';

/**
 * Legacy placeholder executor (TASK-004).
 * Superseded by `BlsHttpWorkflowTaskExecutor` dispatcher in `bls-workflow/` (DEC-004).
 * Kept for reference / optional unit doubles — not wired in BlsHttpWorkflowModule.
 */
@Injectable()
export class StubBlsHttpWorkflowTaskExecutor implements IBlsHttpWorkflowTaskExecutor {
  private readonly logger = new Logger(StubBlsHttpWorkflowTaskExecutor.name);

  async execute(
    input: BlsHttpWorkflowTaskExecutorInput,
  ): Promise<BlsHttpWorkflowTaskExecutorResult> {
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
