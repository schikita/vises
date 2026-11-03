import type { AnalyticsQuery } from '@/entities/analytics'
import {
  ANALYTICS_RANGE_MODE,
  type AnalyticsRangeMode,
} from '@/features/analytics-filters'

/**
 * Current totals → omit from/to.
 * Range mode → forward non-empty from/to for receivedAt filtering (AC-12a).
 */
export const resolveAnalyticsQueryParams = (
  mode: AnalyticsRangeMode,
  from: string,
  to: string,
): AnalyticsQuery => {
  if (mode === ANALYTICS_RANGE_MODE.Current) {
    return {}
  }
  const params: AnalyticsQuery = {}
  if (from.trim().length > 0) {
    params.from = from.trim()
  }
  if (to.trim().length > 0) {
    params.to = to.trim()
  }
  return params
}
