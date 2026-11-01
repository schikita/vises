import type { ApplicationStatus } from '@vises/contracts';
import { SEED_DEFAULT_PRICE } from './demo-settings.constants';

/** FR-11 / AC-19 composition knobs (money as scale-2 decimal strings). */
export const SEED_TOP_UP_REASON = 'seed';
export const SEED_CLIENT_CREATION_DEBIT_REASON = 'client_creation';

/** Decimal-string form of {@link SEED_DEFAULT_PRICE} (single source of truth). */
export const SEED_PRICE_PER_CLIENT_AMOUNT = `${SEED_DEFAULT_PRICE.toFixed(2)}`;
export const SEED_AGENT_A_TOP_UP_AMOUNT = '1800.00';
export const SEED_AGENT_B_TOP_UP_AMOUNT = '900.00';
export const SEED_AGENT_A_FINAL_BALANCE = '360.00';
export const SEED_AGENT_B_FINAL_BALANCE = '0.00';

/** Agent A: 2 drafting, 2 pending, 1 rejected, 2 booked, 1 issued. */
export const SEED_AGENT_A_STATUSES: readonly ApplicationStatus[] = [
  'drafting',
  'drafting',
  'pending',
  'pending',
  'rejected',
  'booked',
  'booked',
  'issued',
];

/** Agent B: 1 drafting, 1 pending, 0 rejected, 2 booked, 1 issued. */
export const SEED_AGENT_B_STATUSES: readonly ApplicationStatus[] = [
  'drafting',
  'pending',
  'booked',
  'booked',
  'issued',
];

/** History actor for drafting → pending (FR-7.4 monitor path). */
export const SEED_MONITOR_ACTOR_ROLE = 'visa_center_monitor';
export const SEED_MONITOR_TRIGGER = 'visa_center_monitor_pending';

/** Staff history trigger label for seeded matrix transitions. */
export const SEED_STAFF_STATUS_TRIGGER = 'seed_status_transition';

/**
 * Non-FR-6 timeline actor for seeded Application.timeline rows.
 * Must never embed applicant first/last names (FR-5.4 / FR-6 / NFR-3).
 */
export const SEED_TIMELINE_ACTOR = 'seed';
