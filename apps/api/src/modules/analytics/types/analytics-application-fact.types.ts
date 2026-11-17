import type { ApplicationStatus } from '@vises/contracts';

/**
 * Per-application analytics fact derived from ApplicationStatusHistory (AC-16).
 * Does not use mutable Application.status.
 * Status ids are BUSINESS six only (FR-15).
 */
export type AnalyticsApplicationFact = {
  applicationId: string;
  agentId: string;
  effectiveStatus: ApplicationStatus;
  /**
   * Intake proxy: first transition TO `not_ready_for_appointment`, else earliest
   * history timestamp (see `resolveReceivedAt`). Not used for date-range filter.
   */
  receivedAt: Date | null;
  /**
   * First history transition into `booked` (used by booked vs unpaid signals).
   */
  bookedAt: Date | null;
  /** `Application.createdAt` — date-range filter dimension. */
  createdAt: Date;
  /** `Application.paymentPaid` (DEC-ASAU-003 / REQ-008). */
  paymentPaid: boolean;
  /** Whole currency units from `Application.paymentAmount` (DEC-ASAU-003). */
  paymentAmount: number;
  /** `Application.submitCity` for §5.1 city distribution. */
  submitCity: string;
  /** `Application.visitDate`; non-empty counts as a visit signal (§5.1). */
  visitDate: string;
};
