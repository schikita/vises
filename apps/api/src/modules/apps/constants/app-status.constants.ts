import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from '@vises/contracts';

/**
 * BUSINESS application status allowlist for upsert / list (FR-12 / ASAU-002).
 * Re-exports contracts SoT — CRM literals (autofill_*, fixes, new, …) excluded.
 */
export const ALL_APP_STATUSES = APPLICATION_STATUSES;

/**
 * Client-allowed statuses on upsert (legacy `{new, docs}` → BUSINESS).
 * DEC-003 / REQ-011.
 */
export const CLIENT_ALLOWED_STATUS = new Set<string>([
  'draft',
  'not_ready_for_appointment',
]);

/** Default status when creating an application (§4.C / FR-12). */
export const DEFAULT_APP_STATUS: ApplicationStatus = 'draft';

/**
 * Legacy CRM literal for needs-fixes messaging only.
 * Not a BUSINESS status — must never be written to `Application.status`
 * (FR-12 / DEC-SPLIT). Timeline util appends a note; it does not set status.
 */
export const APP_STATUS_NEEDS_FIXES = 'fixes' as const;

/** Timeline line when validation needs-fixes is noted (SYSTEM UI signal). */
export const APP_STATUS_NEEDS_FIXES_TIMELINE_TEXT = 'Статус: Нужны правки';

/** Timeline actor for automated needs-fixes notes. */
export const APP_STATUS_SYSTEM_ACTOR = 'Система';
