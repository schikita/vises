/**
 * Field progress reason codes for STATUS checkpoints (ids only — no values).
 * Skip codes honor OQ-007 (optional/conditional missing → skip).
 */
export const PORTAL_STATUS_FIELD_SKIP_REASON = {
  OPTIONAL_MISSING: 'OPTIONAL_MISSING',
  CONDITIONAL_SECTION_INACTIVE: 'CONDITIONAL_SECTION_INACTIVE',
  ALREADY_FILLED: 'ALREADY_FILLED',
} as const;

/** Fail reason codes persisted without field values (REQ-016 / NFR-002). */
export const PORTAL_STATUS_FIELD_FAIL_REASON = {
  REQUIRED_MISSING_SOURCE: 'REQUIRED_MISSING_SOURCE',
  READBACK_MISMATCH: 'READBACK_MISMATCH',
  WIDGET_ERROR: 'WIDGET_ERROR',
  VALIDATION_SUMMARY: 'VALIDATION_SUMMARY',
  ENGLISH_UNSAFE: 'ENGLISH_UNSAFE',
  LIVE_FORM_MISMATCH: 'LIVE_FORM_MISMATCH',
  STALE_DATEPICKER: 'STALE_DATEPICKER',
} as const;

/**
 * Staff-oriented durable errorCode when CRM cannot supply a required field
 * (fail closed — do not invent values; NOT_SAFE / staff).
 */
export const PORTAL_STATUS_EDIT_FILL_NOT_SAFE_ERROR_CODE =
  'ma_edit_fill_not_safe';
