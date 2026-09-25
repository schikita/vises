import { PORTAL_AUTOFILL_EVIDENCE_SUBDIR } from '../constants';

/** Relative path stored in DB: `portal-autofill/{applicationId}/{runId}.png`. */
export const buildEvidenceRelativePath = (
  applicationId: string,
  runId: string,
): string =>
  `${PORTAL_AUTOFILL_EVIDENCE_SUBDIR}/${applicationId}/${runId}.png`;
