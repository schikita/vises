/** TanStack Query keys for clients + passport (FE9 / Decision 2A). */
export const CLIENT_QUERY_KEYS = {
  all: ['clients'] as const,
  list: () => [...CLIENT_QUERY_KEYS.all, 'list'] as const,
  detail: (clientId: string) =>
    [...CLIENT_QUERY_KEYS.all, 'detail', clientId] as const,
} as const
