import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from '@vises/contracts';
import type { AppsByStatusRow } from '../types';

const isApplicationStatus = (value: string): value is ApplicationStatus =>
  (APPLICATION_STATUSES as readonly string[]).includes(value);

/**
 * Zero-fill all six BUSINESS status buckets for dashboard charts (FR-14 / ASAU-005a).
 * Unknown / legacy DB statuses are ignored until migration remaps them.
 */
export const fillAppsByStatusBuckets = (
  sparse: ReadonlyArray<{ status: string; count: number }>,
): AppsByStatusRow[] => {
  const byStatus = new Map<ApplicationStatus, number>();
  for (const row of sparse) {
    if (!isApplicationStatus(row.status)) {
      continue;
    }
    byStatus.set(row.status, (byStatus.get(row.status) ?? 0) + row.count);
  }
  return APPLICATION_STATUSES.map(
    (status): AppsByStatusRow => ({
      status,
      count: byStatus.get(status) ?? 0,
    }),
  );
};
