import type { BlsApplicantPortalStatus } from './bls-applicant-portal-status.types';
import type { PortalStatusCheckpointStep } from './portal-status-checkpoint.types';

/** Inputs for STATUS_VALIDATE resume entry (spec §5/§9 — live scrape preferred). */
export type ResolvePortalStatusResumeEntryInput = {
  /** Live scrape status when Manage Applicants is reachable; null if page unreachable. */
  liveStatus: BlsApplicantPortalStatus | null;
  /** Prior durable checkpoint step; null when no checkpoint. */
  lastCompletedStep: PortalStatusCheckpointStep | null;
  /** False when scrape/nav failed mid-retry — stored step chooses entry. */
  pageReachable: boolean;
};

export type ResolvePortalStatusResumeEntryResult = {
  /** Portal step to resume from (checkpoint `lastCompletedStep` family). */
  resumeEntry: PortalStatusCheckpointStep;
  /** Short safe token for notes / evidence (no PII). */
  resumeHint: string;
  /** True when entry came from stored checkpoint because page was unreachable. */
  usedStoredCheckpoint: boolean;
};
