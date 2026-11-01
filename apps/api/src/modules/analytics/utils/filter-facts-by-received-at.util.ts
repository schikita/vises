import type { AnalyticsApplicationFact, AnalyticsDateRange } from '../types';

/**
 * AC-15b / §6.7.1: in-period metrics include an application iff its
 * `receivedAt` falls inside the inclusive range. Null range = no filter.
 * Apps without `receivedAt` are excluded from date-filtered sets.
 */
export const filterFactsByReceivedAt = (
  facts: AnalyticsApplicationFact[],
  dateRange: AnalyticsDateRange | null,
): AnalyticsApplicationFact[] => {
  if (dateRange === null) {
    return facts;
  }
  return facts.filter((fact): boolean => {
    if (fact.receivedAt === null) {
      return false;
    }
    if (dateRange.from !== null && fact.receivedAt < dateRange.from) {
      return false;
    }
    if (dateRange.to !== null && fact.receivedAt > dateRange.to) {
      return false;
    }
    return true;
  });
};
