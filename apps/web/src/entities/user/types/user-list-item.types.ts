import type { User } from './user.types'

/** Users list row with latest application id for navigation (DEC-007). */
export type UserListItem = User & {
  latestAppId: string | null
}
