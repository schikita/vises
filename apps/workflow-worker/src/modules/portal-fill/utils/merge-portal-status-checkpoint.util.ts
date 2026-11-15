import type {
  PortalStatusCheckpoint,
  PortalStatusCheckpointPatch,
} from '../types/portal-status-checkpoint.types';

/**
 * Apply a pipeline patch onto the in-memory checkpoint bag.
 * Does not persist; never copies field values.
 */
export const mergePortalStatusCheckpoint = (
  current: PortalStatusCheckpoint,
  patch: PortalStatusCheckpointPatch,
): PortalStatusCheckpoint => {
  const next: PortalStatusCheckpoint = {
    ...current,
    fieldProgress: patch.fieldProgress
      ? {
          filled: [...patch.fieldProgress.filled],
          skipped: [...patch.fieldProgress.skipped],
          failed: patch.fieldProgress.failed.map((entry) => ({
            fieldId: entry.fieldId,
            reasonCode: entry.reasonCode,
          })),
        }
      : {
          filled: [...current.fieldProgress.filled],
          skipped: [...current.fieldProgress.skipped],
          failed: current.fieldProgress.failed.map((entry) => ({
            fieldId: entry.fieldId,
            reasonCode: entry.reasonCode,
          })),
        },
  };

  if (patch.lastCompletedStep !== undefined) {
    next.lastCompletedStep = patch.lastCompletedStep;
  }
  if (patch.locationId !== undefined) {
    next.locationId = patch.locationId;
  }
  if (patch.visaTypeId !== undefined) {
    next.visaTypeId = patch.visaTypeId;
  }
  if (patch.memberBranch !== undefined) {
    next.memberBranch = patch.memberBranch;
  }

  return next;
};
