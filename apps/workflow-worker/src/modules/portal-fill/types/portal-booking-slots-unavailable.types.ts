import type { PortalBookingCheckpointCallbacks } from './portal-booking-checkpoint.types';
import type { PortalPage } from './patchright-surface.types';

/** Options for post-captcha slots-unavailable detect + Try Again (REQ-014 / VT-TASK-009). */
export type RunPortalBookingSlotsUnavailablePhaseOptions = {
  page: PortalPage;
  onCheckpoint?: PortalBookingCheckpointCallbacks['onCheckpoint'];
  logPrefix?: string;
};

/**
 * Slots phase outcome. Absent banner is `slotsUnavailable: false` (caller
 * classifies UNKNOWN_NEXT staff terminal — DEC-004 / OQ-007 / VT-TASK-010).
 * Do not invent calendar success for missing slots page (REQ-014 / REQ-017).
 */
export type RunPortalBookingSlotsUnavailablePhaseResult = {
  ok: boolean;
  /** True when exact slots-unavailable banner text was visible. */
  slotsUnavailable: boolean;
  /**
   * True when Try Again was clicked and booking selection UI became ready
   * again (`waitForPortalBookingSelectionUi`).
   */
  tryAgainOk?: boolean;
  error?: string;
  errorCode?: string;
  notes: string[];
};
