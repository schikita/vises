/** TanStack Query keys for settings (FE7 / AC-13). */
export const SETTINGS_QUERY_KEYS = {
  all: ['settings'] as const,
  detail: () => [...SETTINGS_QUERY_KEYS.all, 'detail'] as const,
} as const
