/**
 * Inclusive date bounds for status-in-period metrics (AC-15b / §6.7.1).
 * `null` on a bound means open-ended. Whole range `null` = current totals.
 */
export type AnalyticsDateRange = {
  from: Date | null;
  to: Date | null;
};
