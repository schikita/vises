import type { User } from '@/entities/user'
import type { UsersListSortState } from '../types'
import { resolveUsersListSortValue } from './resolve-users-list-sort-value.util'

export const sortUsersList = (users: readonly User[], sort: UsersListSortState): User[] => {
  const factor = sort.dir === 'asc' ? 1 : -1
  return [...users].sort((a, b) => {
    const left = resolveUsersListSortValue(a, sort.key).toLowerCase()
    const right = resolveUsersListSortValue(b, sort.key).toLowerCase()
    return left.localeCompare(right, 'ru') * factor
  })
}
