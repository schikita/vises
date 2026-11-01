import type { ApplicationStatus } from '@vises/contracts';

/**
 * Per-application analytics fact derived from ApplicationStatusHistory (AC-16).
 * Does not use mutable Application.status.
 */
export type AnalyticsApplicationFact = {
  applicationId: string;
  agentId: string;
  effectiveStatus: ApplicationStatus;
  /** First drafting → pending history timestamp (§6.7.1). */
  receivedAt: Date | null;
  /** First booked → issued history timestamp (§6.7.1). */
  issuedAt: Date | null;
};
