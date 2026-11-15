import type { PortalStatusCheckpoint } from '../types/portal-status-checkpoint.types';
import { summarizePortalStatusFieldProgress } from './summarize-portal-status-field-progress.util';

/**
 * Safe log line for checkpoint persist (counts + step ids — no field values).
 */
export const formatPortalStatusCheckpointLogSummary = (
  checkpoint: PortalStatusCheckpoint,
): string => {
  const counts = summarizePortalStatusFieldProgress(checkpoint.fieldProgress);
  return [
    `step=${checkpoint.lastCompletedStep}`,
    `applicantId=${checkpoint.applicantId}`,
    `filled=${counts.filled}`,
    `skipped=${counts.skipped}`,
    `failed=${counts.failed}`,
    checkpoint.locationId !== undefined
      ? `locationId=${checkpoint.locationId}`
      : null,
    checkpoint.visaTypeId !== undefined
      ? `visaTypeId=${checkpoint.visaTypeId}`
      : null,
    checkpoint.memberBranch !== undefined
      ? `memberBranch=${checkpoint.memberBranch}`
      : null,
  ]
    .filter((part): part is string => part != null)
    .join(' ');
};
