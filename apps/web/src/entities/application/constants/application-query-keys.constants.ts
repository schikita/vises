/** TanStack Query keys for applications + status history (FE10 / AC-9). */
export const APPLICATION_QUERY_KEYS = {
  all: ['applications'] as const,
  list: (params: Record<string, unknown>) =>
    [...APPLICATION_QUERY_KEYS.all, 'list', params] as const,
  detail: (applicationId: string) =>
    [...APPLICATION_QUERY_KEYS.all, 'detail', applicationId] as const,
  history: (applicationId: string) =>
    [...APPLICATION_QUERY_KEYS.all, 'history', applicationId] as const,
} as const
