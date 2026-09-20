import { PORTAL_AUTOFILL_LOCK_STALE_MS } from '../constants';
import { isPortalAutofillLockStale } from './is-portal-autofill-lock-stale.util';

/**
 * True when an in-progress run holds a live (non-stale) lock lease (DEC-008).
 */
export const hasPortalAutofillLiveNonStaleLock = (input: {
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
  return !isPortalAutofillLockStale(
    input.lockHeartbeatAt,
    input.nowMs,
    input.staleMs ?? PORTAL_AUTOFILL_LOCK_STALE_MS,
  );
};
