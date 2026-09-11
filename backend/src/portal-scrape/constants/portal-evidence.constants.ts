/**
 * Managed evidence root under `UPLOAD_DIR` (DEC-002).
 * Layout: `{UPLOAD_DIR}/portal-autofill/{applicationId}/{runId}.png`.
 * PNGs contain PII; staff-only download API; v1 has no automatic purge (REQ-011).
 */
export const PORTAL_AUTOFILL_EVIDENCE_SUBDIR = 'portal-autofill';

/** Capture outcome literals for `portal_autofill_runs.capture_status` (DEC-001). */
export const PORTAL_AUTOFILL_CAPTURE_STATUS = {
  CAPTURED: 'captured',
  CAPTURE_FAILED: 'capture_failed',
} as const;

export type PortalAutofillCaptureStatus =
  (typeof PORTAL_AUTOFILL_CAPTURE_STATUS)[keyof typeof PORTAL_AUTOFILL_CAPTURE_STATUS];

/** Default page size for list-by-application (DEC-004 / NFR-006). */
export const PORTAL_AUTOFILL_RUN_LIST_DEFAULT_LIMIT = 50;

/** Hard cap for list-by-application `limit` query (DEC-004). */
export const PORTAL_AUTOFILL_RUN_LIST_MAX_LIMIT = 100;
