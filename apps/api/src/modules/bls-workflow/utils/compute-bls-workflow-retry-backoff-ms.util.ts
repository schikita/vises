import {
  BLS_WORKFLOW_RETRY_BACKOFF_BASE_MS,
  BLS_WORKFLOW_RETRY_BACKOFF_CAP_MS,
} from '../constants/bls-workflow.constants';

/**
 * Exponential backoff delay for auto-retry (DEC-014).
 * Formula: base × 2^(attemptNo-1), capped at 5 minutes.
 * `attemptNo` is 1-based (first failure → 5s).
 */
export const computeBlsWorkflowRetryBackoffMs = (attemptNo: number): number => {
  const n = Number.isFinite(attemptNo) ? Math.max(1, Math.floor(attemptNo)) : 1;
  const raw = BLS_WORKFLOW_RETRY_BACKOFF_BASE_MS * 2 ** (n - 1);
  return Math.min(raw, BLS_WORKFLOW_RETRY_BACKOFF_CAP_MS);
};
