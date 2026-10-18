import {
  PORTAL_AUTOFILL_FIELD_PROGRESS_STATUS,
} from '../constants';
import type { PortalFieldProgressSummary } from '../types';

/**
 * Summarize durable `field_progress_json` into aggregate counts (REQ-004 / REQ-007).
 * Ignores unknown status tokens; never reads field values.
 */
export const summarizePortalFieldProgressJson = (
  fieldProgressJson: Record<string, { status: string; reason?: string }> | null,
): PortalFieldProgressSummary | null => {
  if (fieldProgressJson == null) {
    return null;
  }

  const entries = Object.values(fieldProgressJson);
  if (entries.length === 0) {
    return { filled: 0, skipped: 0, failed: 0 };
  }

  let filled = 0;
  let skipped = 0;
  let failed = 0;
  for (const entry of entries) {
    if (entry.status === PORTAL_AUTOFILL_FIELD_PROGRESS_STATUS.FILLED) {
      filled += 1;
    } else if (entry.status === PORTAL_AUTOFILL_FIELD_PROGRESS_STATUS.SKIPPED) {
      skipped += 1;
    } else if (entry.status === PORTAL_AUTOFILL_FIELD_PROGRESS_STATUS.FAILED) {
      failed += 1;
    }
  }

  return { filled, skipped, failed };
};
