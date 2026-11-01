import type { AnalyticsDateRange } from '../types';
import { parseAnalyticsDateBound } from './parse-analytics-date-bound.util';

/**
 * Build inclusive date range for status-in-period metrics.
 * Both omitted → `null` (current totals ignore dates — §6.7.1).
 */
export const parseAnalyticsDateRange = (params: {
  from?: string;
  to?: string;
}): AnalyticsDateRange | null => {
  const fromRaw = params.from?.trim() ?? '';
  const toRaw = params.to?.trim() ?? '';
  if (fromRaw === '' && toRaw === '') {
    return null;
  }
  return {
    from: fromRaw === '' ? null : parseAnalyticsDateBound(fromRaw, 'start'),
    to: toRaw === '' ? null : parseAnalyticsDateBound(toRaw, 'end'),
  };
};
