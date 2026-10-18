import { BLS_WORKFLOW_ABORT_ERROR_CODE } from '../constants/bls-workflow.constants';
import type { BlsWorkflowTaskExecutorResult } from '../types/bls-workflow-runner.types';

/**
 * True when the executor returned the abort-coded failure (DEC-003 / DEC-008).
 * Skipped results are never treated as abort.
 */
export const isBlsWorkflowAbortResult = (
  result: BlsWorkflowTaskExecutorResult,
): boolean =>
  result.ok === false &&
  result.skipped !== true &&
  result.errorCode === BLS_WORKFLOW_ABORT_ERROR_CODE;
