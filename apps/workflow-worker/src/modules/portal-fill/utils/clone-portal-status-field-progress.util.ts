import type { PortalStatusFieldProgress } from '../types/portal-status-checkpoint.types';

export const clonePortalStatusFieldProgress = (
  progress: PortalStatusFieldProgress,
): PortalStatusFieldProgress => ({
  filled: [...progress.filled],
  skipped: [...progress.skipped],
  failed: progress.failed.map((entry) => ({
    fieldId: entry.fieldId,
    reasonCode: entry.reasonCode,
  })),
});
