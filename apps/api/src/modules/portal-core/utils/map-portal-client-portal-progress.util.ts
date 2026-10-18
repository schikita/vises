import { PORTAL_AUTOFILL_RUN_STATUS } from '../constants';
import type {
  PortalClientPortalProgress,
  PortalClientPortalProgressMapInput,
  PortalClientPortalSendState,
} from '../types';
import { summarizePortalFieldProgressJson } from './summarize-portal-field-progress-json.util';

/**
 * Map durable runs + adapter site outcome → client-safe portal progress (DEC-007).
 * No pipeline internals, CB dumps, screenshot paths, or secrets (NFR-002).
 */
export const mapPortalClientPortalProgress = (
  input: PortalClientPortalProgressMapInput,
): PortalClientPortalProgress => {
  const { dataSaved, runs, siteOutcome } = input;

  let portalSend: PortalClientPortalSendState = 'not_started';
  if (runs.length > 0) {
    const hasInProgress = runs.some(
      (r) => r.status === PORTAL_AUTOFILL_RUN_STATUS.IN_PROGRESS,
    );
    if (hasInProgress) {
      portalSend = 'in_progress';
    } else {
      const newest = runs[0];
      if (newest.status === PORTAL_AUTOFILL_RUN_STATUS.SUCCEEDED) {
        portalSend = 'succeeded';
      } else if (
        newest.status === PORTAL_AUTOFILL_RUN_STATUS.FAILED ||
        newest.status === PORTAL_AUTOFILL_RUN_STATUS.ABANDONED
      ) {
        portalSend = 'failed';
      } else if (newest.status == null) {
        // Legacy evidence-only row: use reportOk (edge case in spec).
        portalSend = newest.reportOk ? 'succeeded' : 'failed';
      } else {
        portalSend = 'attempted';
      }
    }
  }

  const latestTerminal = runs.find(
    (r) => r.status !== PORTAL_AUTOFILL_RUN_STATUS.IN_PROGRESS,
  );
  const fillSummary = latestTerminal
    ? summarizePortalFieldProgressJson(latestTerminal.fieldProgressJson)
    : null;

  return {
    dataSaved,
    portalSend,
    fillSummary,
    siteOutcome,
  };
};
