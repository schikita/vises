import {
  PORTAL_AUTOFILL_RUN_LIST_DEFAULT_LIMIT,
  PORTAL_AUTOFILL_RUN_LIST_MAX_LIMIT,
} from '../constants';

/**
 * Parse optional `limit` query and clamp to DEC-004 bounds (default 50, max 100).
 * Invalid / missing values fall back to the default.
 */
export const clampPortalAutofillRunListLimit = (
  raw: string | undefined,
): number => {
  if (raw === undefined || raw.trim() === '') {
    return PORTAL_AUTOFILL_RUN_LIST_DEFAULT_LIMIT;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return PORTAL_AUTOFILL_RUN_LIST_DEFAULT_LIMIT;
  }
  return Math.min(Math.floor(parsed), PORTAL_AUTOFILL_RUN_LIST_MAX_LIMIT);
};
