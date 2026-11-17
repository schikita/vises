import type { ApplicationStatus } from '@vises/contracts';

/**
 * Spec §4.D / ASAU-004 — CRM + FR-7 literals → BUSINESS.
 * Already-BUSINESS ids are handled as identity in the map util (not listed here).
 */
export const LEGACY_APPLICATION_STATUS_TO_BUSINESS = {
  new: 'draft',
  drafting: 'draft',
  docs: 'not_ready_for_appointment',
  review: 'not_ready_for_appointment',
  fixes: 'not_ready_for_appointment',
  pending: 'not_ready_for_appointment',
  autofill_ok: 'not_ready_for_appointment',
  autofill_failed: 'filling',
  ready: 'ready_for_appointment',
  booked: 'booked',
  done: 'booked',
  issued: 'booked',
  declined: 'declined',
  rejected: 'declined',
} as const satisfies Record<string, ApplicationStatus>;

/** Audit history trigger appended once per application during ASAU-004 migration. */
export const LEGACY_BUSINESS_STATUS_MIGRATION_TRIGGER =
  'legacy_business_status_migration_v1' as const;

/** Actor role for migration audit history rows (§4.D). */
export const LEGACY_BUSINESS_STATUS_MIGRATION_ACTOR_ROLE = 'system' as const;

/**
 * Target `applications.status` varchar length (≥32) so BUSINESS ids fit
 * (`ready_for_appointment`=21, `not_ready_for_appointment`=25).
 */
export const APPLICATION_STATUS_VARCHAR_LENGTH = 32 as const;
