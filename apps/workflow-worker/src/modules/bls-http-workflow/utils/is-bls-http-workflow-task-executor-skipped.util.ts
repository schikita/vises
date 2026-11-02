import type {
  BlsHttpWorkflowTaskExecutorResult,
  BlsHttpWorkflowTaskExecutorSkipped,
} from '../types/bls-http-workflow-runner.types';

/** True when executor signals conditional step skip (REQ-012). */
export const isBlsHttpWorkflowTaskExecutorSkipped = (
  result: BlsHttpWorkflowTaskExecutorResult,
): result is BlsHttpWorkflowTaskExecutorSkipped =>
  result.ok === false && result.skipped === true;
