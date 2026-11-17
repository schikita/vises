import type { AnalyticsApplicationFact, AnalyticsDateRange } from '../types';

/**
 * Inclusive date-range filter by application `createdAt`.
 * Null range = no filter. Includes all applications created in the period
 * (not only those that reached `booked`).
 */
export const filterFactsByCreatedAt = (
  facts: AnalyticsApplicationFact[],
  dateRange: AnalyticsDateRange | null,
): AnalyticsApplicationFact[] => {
  if (dateRange === null) {
    return facts;
  }
  return facts.filter((fact): boolean => {
    if (dateRange.from !== null && fact.createdAt < dateRange.from) {
      return false;
    }
    if (dateRange.to !== null && fact.createdAt > dateRange.to) {
      return false;
    }
    return true;
  });
};
