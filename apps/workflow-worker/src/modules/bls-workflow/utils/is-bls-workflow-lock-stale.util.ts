import { BLS_WORKFLOW_LOCK_STALE_MS } from '../constants/bls-workflow.constants';

/**
 * True when the workflow lock heartbeat is missing or older than the stale TTL
 * (REQ-005 / DEC-003). Missing heartbeat is treated as free for reclaim.
 */
export const isBlsWorkflowLockStale = (
  lockHeartbeatAt: Date | null | undefined,
  nowMs: number,
  staleMs: number = BLS_WORKFLOW_LOCK_STALE_MS,
): boolean => {
  if (lockHeartbeatAt == null) {
    return true;
  }
  return nowMs - lockHeartbeatAt.getTime() > staleMs;
};
