import { BLS_WORKFLOW_LOCK_STALE_MS } from '../constants/bls-workflow.constants';
import { isBlsWorkflowLockStale } from './is-bls-workflow-lock-stale.util';

/**
 * True when a workflow holds a live (non-stale) lock lease (REQ-005 / DEC-003).
 */
export const hasBlsWorkflowLiveNonStaleLock = (input: {
  lockOwner: string | null;
  lockHeartbeatAt: Date | null;
  nowMs: number;
  staleMs?: number;
}): boolean => {
  const hasLiveOwner =
    typeof input.lockOwner === 'string' && input.lockOwner.trim().length > 0;
  if (!hasLiveOwner) {
    return false;
  }
  return !isBlsWorkflowLockStale(
    input.lockHeartbeatAt,
    input.nowMs,
    input.staleMs ?? BLS_WORKFLOW_LOCK_STALE_MS,
  );
};
