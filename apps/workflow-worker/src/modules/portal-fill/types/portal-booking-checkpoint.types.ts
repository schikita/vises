import type { PORTAL_BOOKING_CHECKPOINT_OUTCOME } from '../constants/portal-booking-checkpoint-outcome.constants';
import type { PORTAL_BOOKING_CHECKPOINT_STEP } from '../constants/portal-booking-checkpoint-step.constants';
import type { PORTAL_BOOKING_CHECKPOINT_STUCK_CODE } from '../constants/portal-booking-checkpoint-stuck-code.constants';
import type { PORTAL_BOOKING_FIELD_PROGRESS_STATUS } from '../constants/portal-booking-field-progress-status.constants';

/** Checkpoint `lastCompletedStep` token (02-database.md §3 / REQ-018). */
export type PortalBookingCheckpointStep =
  (typeof PORTAL_BOOKING_CHECKPOINT_STEP)[keyof typeof PORTAL_BOOKING_CHECKPOINT_STEP];

/** Checkpoint `lastOutcome` token (02-database.md §3). */
export type PortalBookingCheckpointOutcome =
  (typeof PORTAL_BOOKING_CHECKPOINT_OUTCOME)[keyof typeof PORTAL_BOOKING_CHECKPOINT_OUTCOME];

/** Checkpoint `stuckCode` (02-database.md §5). */
export type PortalBookingCheckpointStuckCode =
  (typeof PORTAL_BOOKING_CHECKPOINT_STUCK_CODE)[keyof typeof PORTAL_BOOKING_CHECKPOINT_STUCK_CODE];

/** Per-field progress status — never CRM / form values (NFR-002 / CON-003). */
export type PortalBookingFieldProgressStatus =
  (typeof PORTAL_BOOKING_FIELD_PROGRESS_STATUS)[keyof typeof PORTAL_BOOKING_FIELD_PROGRESS_STATUS];

/**
 * Field id → status only. Keys are opaque field ids; values are progress
 * codes. Never store field values, email HTML, or consent `data=` tokens.
 */
export type PortalBookingFieldProgress = Record<
  string,
  PortalBookingFieldProgressStatus
>;

/**
 * Durable BOOK checkpoint JSON on `bls_workflow_tasks.portal_checkpoint_json`
 * (02-database.md §3 / REQ-006 / REQ-018). Reuses MA Option A columns.
 */
export type PortalBookingCheckpoint = {
  lastCompletedStep: PortalBookingCheckpointStep;
  dataProtectionConsentDone: boolean;
  /** Opaque message id only — never email body (NFR-002). */
  dataProtectionMessageId?: string;
  bookingFieldProgress?: PortalBookingFieldProgress;
  lastOutcome?: PortalBookingCheckpointOutcome;
  stuckCode?: PortalBookingCheckpointStuckCode;
};

/**
 * Partial update from booking pipeline transitions (REQ-018).
 * Never includes field values, email HTML, or consent tokens.
 * `lastOutcome` / `stuckCode` may be `null` to clear CAPTCHA_PENDING (etc.)
 * after success (VT-TASK-008).
 */
export type PortalBookingCheckpointPatch = {
  lastCompletedStep?: PortalBookingCheckpointStep;
  dataProtectionConsentDone?: boolean;
  dataProtectionMessageId?: string;
  bookingFieldProgress?: PortalBookingFieldProgress;
  lastOutcome?: PortalBookingCheckpointOutcome | null;
  stuckCode?: PortalBookingCheckpointStuckCode | null;
};

/** Async sink so booking clients can persist without coupling to TypeORM. */
export type PortalBookingCheckpointCallbacks = {
  onCheckpoint?: (patch: PortalBookingCheckpointPatch) => Promise<void>;
};

/** Loaded BOOK checkpoint (null = resume-from-scratch). */
export type LoadPortalBookingCheckpointResult = {
  checkpoint: PortalBookingCheckpoint | null;
};

/**
 * Persist `portal_checkpoint_json` for a BOOK task.
 * Optionally set sibling `portal_status` when a status token is known.
 */
export type SavePortalBookingCheckpointInput = {
  taskId: string;
  /** When omitted, only `portal_checkpoint_json` is updated. */
  portalStatus?: string;
  checkpoint: PortalBookingCheckpoint;
};
