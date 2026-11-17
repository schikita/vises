import { APPLICATION_STATUSES } from '@vises/contracts';
import { SEED_DEFAULT_PRICE } from './demo-settings.constants';

/** FR-11 / AC-19 composition knobs (money as scale-2 decimal strings). */
export const SEED_TOP_UP_REASON = 'seed';
export const SEED_CLIENT_CREATION_DEBIT_REASON = 'client_creation';

/** Decimal-string form of {@link SEED_DEFAULT_PRICE} (single source of truth). */
export const SEED_PRICE_PER_CLIENT_AMOUNT = `${SEED_DEFAULT_PRICE.toFixed(2)}`;

/** Status pool for random per-application draws (BUSINESS six-value union). */
export const SEED_APPLICATION_STATUS_POOL = APPLICATION_STATUSES;

/** History actor for draft → not_ready_for_appointment (FR-13 monitor path). */
export const SEED_MONITOR_ACTOR_ROLE = 'visa_center_monitor';
export const SEED_MONITOR_TRIGGER = 'visa_center_monitor_pending';

/** Staff history trigger label for seeded matrix transitions. */
export const SEED_STAFF_STATUS_TRIGGER = 'seed_status_transition';

/**
 * Non-FR-6 timeline actor for seeded Application.timeline rows.
 * Must never embed applicant first/last names (FR-5.4 / FR-6 / NFR-3).
 */
export const SEED_TIMELINE_ACTOR = 'seed';
