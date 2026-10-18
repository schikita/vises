import type {
  BlsWorkflowTaskExecutorInput,
  BlsWorkflowTaskExecutorResult,
} from '../types/bls-workflow-runner.types';

/**
 * Port for one-task domain execution (DEC-008).
 * Runner owns scheduling / locks; clients own Patchright.
 */
export interface IBlsWorkflowTaskExecutor {
  execute(
    input: BlsWorkflowTaskExecutorInput,
  ): Promise<BlsWorkflowTaskExecutorResult>;
}
