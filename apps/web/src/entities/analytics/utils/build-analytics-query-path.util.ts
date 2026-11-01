import type { AnalyticsQueryParams } from '../types'

/** Build `GET /stats/roles-applications` path with optional from/to query. */
export const buildAnalyticsQueryPath = (
  query: AnalyticsQueryParams,
): string => {
  const params = new URLSearchParams()
  if (query.from) {
    params.set('from', query.from)
  }
  if (query.to) {
    params.set('to', query.to)
  }
  const qs = params.toString()
  return qs.length > 0
    ? `/stats/roles-applications?${qs}`
    : '/stats/roles-applications'
}
