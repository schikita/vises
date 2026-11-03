import type { AnalyticsQuery } from '../types'

/** Build `GET /stats/roles-applications` path with optional from/to/page query. */
export const buildAnalyticsQueryPath = (
  query: AnalyticsQuery,
): string => {
  const params = new URLSearchParams()
  if (query.from) {
    params.set('from', query.from)
  }
  if (query.to) {
    params.set('to', query.to)
  }
  if (query.page !== undefined) {
    params.set('page', String(query.page))
  }
  if (query.pageSize !== undefined) {
    params.set('pageSize', String(query.pageSize))
  }
  if (query.q !== undefined && query.q.trim() !== '') {
    params.set('q', query.q.trim())
  }
  const qs = params.toString()
  return qs.length > 0
    ? `/stats/roles-applications?${qs}`
    : '/stats/roles-applications'
}
