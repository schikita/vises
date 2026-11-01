import type { FetchUsersPageParams } from '../types/fetch-users-page-params.types'

/** TanStack Query keys for users admin (FE6). */
export const USER_QUERY_KEYS = {
  all: ['users'] as const,
  list: (params: FetchUsersPageParams) =>
    [...USER_QUERY_KEYS.all, 'list', params] as const,
} as const
