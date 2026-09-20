import { PORTAL_AUTOFILL_LOCK_STALE_MS } from '../constants';

/**
 * True when the run lock heartbeat is missing or older than the stale TTL (REQ-009 / DEC-007).
 * A missing heartbeat with no owner is treated as free (stale for reclaim purposes).
 */
export const isPortalAutofillLockStale = (
  lockHeartbeatAt: Date | null | undefined,
  nowMs: number,
  staleMs: number = PORTAL_AUTOFILL_LOCK_STALE_MS,
): boolean => {
  if (lockHeartbeatAt == null) {
    return true;
  }
  return nowMs - lockHeartbeatAt.getTime() > staleMs;
};
