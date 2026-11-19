import type { AnalyticsQuery } from '../types'

/** TanStack Query keys for roles-applications analytics (FE11 / AC-12 / FE17). */
export const ANALYTICS_QUERY_KEYS = {
  all: ['analytics'] as const,
  rolesApplications: (query: AnalyticsQuery) =>
    [
      ...ANALYTICS_QUERY_KEYS.all,
      'roles-applications',
      query.from ?? null,
      query.to ?? null,
    ] as const,
} as const
