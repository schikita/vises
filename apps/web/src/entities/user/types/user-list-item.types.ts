import type { User } from './user.types'

/**
 * Users/agents list row (SoT: `UserOut` + `latestAppId`).
 * Metric fields are optional placeholders until SoT exposes them again.
 */
export type UserListItem = User & {
  latestAppId: string | null
  clientsCount?: number | null
  currentBalance?: string | null
  totalRevenue?: string | null
}
