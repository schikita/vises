import { PORTAL_AUTOFILL_RUN_STATUS } from '../constants';
import type { PortalAutofillRunStatus } from '../types';

/** Normalize persisted run status string to a known literal or null (legacy). */
export const resolvePortalAutofillRunStatus = (
  raw: string | null,
): PortalAutofillRunStatus | null => {
  if (
    raw === PORTAL_AUTOFILL_RUN_STATUS.IN_PROGRESS ||
    raw === PORTAL_AUTOFILL_RUN_STATUS.SUCCEEDED ||
    raw === PORTAL_AUTOFILL_RUN_STATUS.FAILED ||
    raw === PORTAL_AUTOFILL_RUN_STATUS.ABANDONED
  ) {
    return raw;
  }
  return null;
};
