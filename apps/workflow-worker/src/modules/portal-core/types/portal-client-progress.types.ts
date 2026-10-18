import type { PortalFieldProgressSummary } from './portal-field-progress-summary.types';
import type { PortalSiteOutcome } from './portal-site-outcome.types';

/**
 * Client-safe portal progress projection (REQ-002–005 / DEC-005 / DEC-007).
 * No pipeline internals, CB dumps, screenshot paths, or secrets.
 */
export type PortalClientPortalSendState =
  | 'not_started'
  | 'in_progress'
  | 'attempted'
  | 'succeeded'
  | 'failed';

export type PortalClientPortalProgress = {
  /** Application persisted on server (client detail always true for saved entity). */
  dataSaved: boolean;
  portalSend: PortalClientPortalSendState;
  fillSummary: PortalFieldProgressSummary | null;
  siteOutcome: PortalSiteOutcome;
};
