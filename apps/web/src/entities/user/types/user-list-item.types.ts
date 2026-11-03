import type { UserListItemDto } from '@vises/contracts'
import type { User } from './user.types'

/** Users list row with T19 enrichment (latestAppId, agent metrics). */
export type UserListItem = User & UserListItemDto
