import type { FieldResult } from '../types';

/** Phase-summary counts for field fill (REQ-008); no per-field success spam. */
export const summarizeFieldFillCounts = (
  fields: FieldResult[],
): { filled: number; failed: number; skipped: number } => {
  let filled = 0;
  let failed = 0;
  let skipped = 0;
  for (const row of fields) {
    if (row.status === 'filled') {
      filled += 1;
    } else if (row.status === 'failed') {
      failed += 1;
    } else {
      skipped += 1;
    }
  }
  return { filled, failed, skipped };
};
