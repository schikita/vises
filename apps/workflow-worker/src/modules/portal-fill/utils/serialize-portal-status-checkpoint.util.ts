import type { PortalStatusCheckpoint } from '../types/portal-status-checkpoint.types';

/**
 * Serialize checkpoint for jsonb — allowlisted keys only (no field values).
 */
export const serializePortalStatusCheckpoint = (
  checkpoint: PortalStatusCheckpoint,
): Record<string, unknown> => {
  const json: Record<string, unknown> = {
    lastCompletedStep: checkpoint.lastCompletedStep,
    applicantId: checkpoint.applicantId,
    fieldProgress: {
      filled: [...checkpoint.fieldProgress.filled],
      skipped: [...checkpoint.fieldProgress.skipped],
      failed: checkpoint.fieldProgress.failed.map((entry) => ({
        fieldId: entry.fieldId,
        reasonCode: entry.reasonCode,
      })),
    },
  };

  if (checkpoint.locationId !== undefined) {
    json.locationId = checkpoint.locationId;
  }
  if (checkpoint.visaTypeId !== undefined) {
    json.visaTypeId = checkpoint.visaTypeId;
  }
  if (checkpoint.memberBranch !== undefined) {
    json.memberBranch = checkpoint.memberBranch;
  }

  return json;
};
