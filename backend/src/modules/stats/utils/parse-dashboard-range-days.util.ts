import {
  DEFAULT_DASHBOARD_RANGE_DAYS,
  MAX_DASHBOARD_RANGE_DAYS,
  MIN_DASHBOARD_RANGE_DAYS,
} from '../constants';

/**
 * Parse and clamp `rangeDays` query (DEC-005). Invalid/missing → default 30.
 */
export const parseDashboardRangeDays = (raw?: string): number => {
  if (raw === undefined || raw === '') {
    return DEFAULT_DASHBOARD_RANGE_DAYS;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) {
    return DEFAULT_DASHBOARD_RANGE_DAYS;
  }
  if (n < MIN_DASHBOARD_RANGE_DAYS) {
    return MIN_DASHBOARD_RANGE_DAYS;
  }
  if (n > MAX_DASHBOARD_RANGE_DAYS) {
    return MAX_DASHBOARD_RANGE_DAYS;
  }
  return n;
};
