import type {
  PortalStatusFieldProgress,
  PortalStatusFieldProgressCounts,
} from '../types/portal-status-checkpoint.types';

/**
 * Summarize STATUS fieldProgress into counts (REQ-016 mirror of register).
 * Never reads or returns field values.
 */
export const summarizePortalStatusFieldProgress = (
  fieldProgress: PortalStatusFieldProgress | null | undefined,
): PortalStatusFieldProgressCounts => {
  if (fieldProgress == null) {
    return { filled: 0, skipped: 0, failed: 0 };
  }
  return {
    filled: fieldProgress.filled.length,
    skipped: fieldProgress.skipped.length,
    failed: fieldProgress.failed.length,
  };
};
