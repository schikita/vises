import type { AnalyticsQuery } from '@/entities/analytics'
import { ANALYTICS_RANGE_MODE } from '../constants'
import type { AnalyticsRangeMode } from '../types'

/**
 * Current totals → omit from/to.
 * Range mode → forward non-empty from/to for createdAt filtering.
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
