import { PORTAL_AUTOFILL_CAPMONSTER_CB_STATE } from '../constants';
import type { PortalAutofillCapMonsterCbState } from '../types';

/** Normalize persisted CB state string to a known literal or null. */
export const resolvePortalAutofillCapMonsterCbState = (
  raw: string | null,
): PortalAutofillCapMonsterCbState | null => {
  if (
    raw === PORTAL_AUTOFILL_CAPMONSTER_CB_STATE.CLOSED ||
    raw === PORTAL_AUTOFILL_CAPMONSTER_CB_STATE.OPEN ||
    raw === PORTAL_AUTOFILL_CAPMONSTER_CB_STATE.HALF_OPEN
  ) {
    return raw;
  }
  return null;
};
