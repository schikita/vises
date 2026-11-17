import { fetchUsersPage } from './fetch-users-page.util'
import type { UserListItem } from '../types'

/** Resolve a Users list row by exact id (uses list `q` id match). */
export const fetchUserListItemById = async (
  userId: string,
): Promise<UserListItem | null> => {
  const data = await fetchUsersPage({
    page: 1,
    pageSize: 1,
    q: userId,
  })
  return data.items.find((user) => user.id === userId) ?? null
}
