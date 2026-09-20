import {
  PORTAL_AUTOFILL_CAPMONSTER_CB_STATE,
  PORTAL_AUTOFILL_LOCK_STALE_MS,
  PORTAL_AUTOFILL_RUN_STATUS,
} from '../constants';
import type { PortalAutofillResumeEligibilityInput } from '../types';
import { isPortalAutofillLockStale } from './is-portal-autofill-lock-stale.util';

/**
 * Whether an in-progress run may be resumed (REQ-007 / REQ-008 / REQ-010 / DEC-003).
 * Live non-stale lock → not eligible (caller maps to 409). CB-open is terminal for the run.
 */
export const isPortalAutofillRunResumeEligible = (
  input: PortalAutofillResumeEligibilityInput,
): boolean => {
  if (input.status !== PORTAL_AUTOFILL_RUN_STATUS.IN_PROGRESS) {
    return false;
  }
  if (input.capmonsterPermanentFailed) {
    return false;
  }
  if (
    input.captchaBudgetDeadlineAt != null &&
    input.nowMs >= input.captchaBudgetDeadlineAt.getTime()
  ) {
    return false;
  }
  if (input.capmonsterCbState === PORTAL_AUTOFILL_CAPMONSTER_CB_STATE.OPEN) {
    return false;
  }

  const hasLiveOwner =
    typeof input.lockOwner === 'string' && input.lockOwner.trim().length > 0;
  if (hasLiveOwner) {
    const stale = isPortalAutofillLockStale(
      input.lockHeartbeatAt,
      input.nowMs,
      input.staleMs ?? PORTAL_AUTOFILL_LOCK_STALE_MS,
    );
    if (!stale) {
      return false;
    }
  }

  return true;
};
