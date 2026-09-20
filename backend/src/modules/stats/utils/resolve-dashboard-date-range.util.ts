import type { DashboardDateRange } from '../types';
import { formatUtcDateKey } from './format-utc-date-key.util';

/**
 * Resolve inclusive UTC day window ending today (DEC-005).
 * Day buckets use UTC midnight boundaries; documented in API `from`/`to`.
 */
export const resolveDashboardDateRange = (
  rangeDays: number,
  now: Date = new Date(),
): DashboardDateRange => {
  const endDayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const from = new Date(endDayStart);
  from.setUTCDate(from.getUTCDate() - (rangeDays - 1));

  const toExclusive = new Date(endDayStart);
  toExclusive.setUTCDate(toExclusive.getUTCDate() + 1);

  const lastInclusive = new Date(toExclusive.getTime() - 1);

  const dayKeys: string[] = [];
  const cursor = new Date(from);
  while (cursor < toExclusive) {
    dayKeys.push(formatUtcDateKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return {
    rangeDays,
    from,
    toExclusive,
    fromIso: from.toISOString(),
    toIso: lastInclusive.toISOString(),
    dayKeys,
  };
};
