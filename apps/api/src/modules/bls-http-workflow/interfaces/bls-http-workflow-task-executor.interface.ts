import type {
  BlsHttpWorkflowTaskExecutorInput,
  BlsHttpWorkflowTaskExecutorResult,
} from '../types/bls-http-workflow-runner.types';

/**
 * Port for one-task domain execution (DEC-008).
 * Runner owns scheduling / locks; clients own Patchright.
 */
export interface IBlsHttpWorkflowTaskExecutor {
  execute(
    input: BlsHttpWorkflowTaskExecutorInput,
  ): Promise<BlsHttpWorkflowTaskExecutorResult>;
}
