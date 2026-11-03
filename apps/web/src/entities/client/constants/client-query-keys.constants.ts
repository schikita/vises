import type { ClientsListQuery } from '@vises/contracts'

/** TanStack Query keys for clients + passport (FE9 / Decision 2A / FE17). */
export const CLIENT_QUERY_KEYS = {
  all: ['clients'] as const,
  list: (query: ClientsListQuery = {}) =>
    [
      ...CLIENT_QUERY_KEYS.all,
      'list',
      query.page ?? null,
      query.pageSize ?? null,
      query.search ?? null,
      query.sortBy ?? null,
    ] as const,
  detail: (clientId: string) =>
    [...CLIENT_QUERY_KEYS.all, 'detail', clientId] as const,
} as const
