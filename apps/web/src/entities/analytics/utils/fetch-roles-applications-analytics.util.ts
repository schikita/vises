import type { AnalyticsDto, AnalyticsQuery } from '@vises/contracts'
import { apiRequest } from '@/shared/api'
import { buildAnalyticsQueryPath } from './build-analytics-query-path.util'

/**
 * GET /stats/roles-applications?from&to → AnalyticsDto (FE11 / AC-12).
 * Omit from/to for current totals; when set, backend filters by receivedAt.
 */
export const fetchRolesApplicationsAnalytics = (
  query: AnalyticsQuery = {},
): Promise<AnalyticsDto> =>
  apiRequest<AnalyticsDto>(buildAnalyticsQueryPath(query))
