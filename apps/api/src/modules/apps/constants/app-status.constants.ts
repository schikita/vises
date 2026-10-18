/** Client-allowed application statuses (DEC-003 / REQ-011). */
export const CLIENT_ALLOWED_STATUS = new Set(['new', 'docs']);

/** Default status when creating an application. */
export const DEFAULT_APP_STATUS = 'new';

/**
 * CRM status when Start / date validation finds applicant data that must be fixed.
 * Label (UI): «Нужны правки».
 */
export const APP_STATUS_NEEDS_FIXES = 'fixes' as const;

/** Timeline line when status is auto-set to needs-fixes. */
export const APP_STATUS_NEEDS_FIXES_TIMELINE_TEXT = 'Статус: Нужны правки';

/** Timeline actor for automated status changes. */
export const APP_STATUS_SYSTEM_ACTOR = 'Система';

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
