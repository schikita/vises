import type { AnalyticsQueryParams } from '../types'

/** TanStack Query keys for roles-applications analytics (FE11 / AC-12). */
export const ANALYTICS_QUERY_KEYS = {
  all: ['analytics'] as const,
  rolesApplications: (query: AnalyticsQueryParams) =>
    [
      ...ANALYTICS_QUERY_KEYS.all,
      'roles-applications',
      query.from ?? null,
      query.to ?? null,
    ] as const,
} as const
