/** Client-allowed application statuses (DEC-003 / REQ-011). */
export const CLIENT_ALLOWED_STATUS = new Set(['new', 'docs']);

/** Default status when creating an application. */
export const DEFAULT_APP_STATUS = 'new';

/**
 * All known CRM application status literals (legacy seven + portal autofill outcomes).
 * DEC-001 / DEC-010 — portal-autofill-staff-trigger.
 */
export const ALL_APP_STATUSES = [
  'new',
  'docs',
  'review',
  'ready',
  'booked',
  'done',
  'fixes',
  'autofill_ok',
  'autofill_failed',
  'declined',
] as const;

export type AppStatusLiteral = (typeof ALL_APP_STATUSES)[number];
