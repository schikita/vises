import type { PortalSiteOutcome } from './portal-site-outcome.types';

/**
 * Input for client-safe portal progress projection (REQ-002–005 / DEC-007).
 * Run rows must already be scoped to the projection applicant.
 */
export type PortalClientPortalProgressRunInput = {
  status: string | null;
  reportOk: boolean;
  fieldProgressJson: Record<string, { status: string; reason?: string }> | null;
};

export type PortalClientPortalProgressMapInput = {
  /** Persisted application entity (client detail always true). */
  dataSaved: boolean;
  /** Newest-first runs for the selected applicant (or empty). */
  runs: PortalClientPortalProgressRunInput[];
  siteOutcome: PortalSiteOutcome;
};
