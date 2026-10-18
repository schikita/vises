import type {
  BlsWorkflowTaskExecutorResult,
  BlsWorkflowTaskExecutorSkipped,
} from '../types/bls-workflow-runner.types';

/** True when executor signals conditional step skip (REQ-012). */
export const isBlsWorkflowTaskExecutorSkipped = (
  result: BlsWorkflowTaskExecutorResult,
): result is BlsWorkflowTaskExecutorSkipped =>
  result.ok === false && result.skipped === true;
