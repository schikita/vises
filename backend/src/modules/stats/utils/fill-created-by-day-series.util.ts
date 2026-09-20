import type { CreatedByDayRow } from '../types';

/**
 * Expand sparse DB day counts into a contiguous series (zeros for missing days).
 */
export const fillCreatedByDaySeries = (
  dayKeys: string[],
  sparse: Array<{ date: string; count: number }>,
): CreatedByDayRow[] => {
  const byDate = new Map(
    sparse.map((row) => [row.date, row.count] as const),
  );
  return dayKeys.map((date) => ({
    date,
    count: byDate.get(date) ?? 0,
  }));
};
