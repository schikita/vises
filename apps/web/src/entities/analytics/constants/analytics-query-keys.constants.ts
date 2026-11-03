import type { AnalyticsQuery } from '../types'

/** TanStack Query keys for roles-applications analytics (FE11 / AC-12 / FE17 / FE23). */
export const ANALYTICS_QUERY_KEYS = {
  all: ['analytics'] as const,
  rolesApplications: (query: AnalyticsQuery) =>
    [
      ...ANALYTICS_QUERY_KEYS.all,
      'roles-applications',
      query.from ?? null,
      query.to ?? null,
      query.page ?? null,
      query.pageSize ?? null,
      query.q ?? null,
    ] as const,
} as const
