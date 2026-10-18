import type { User } from '@/entities/user'
import { ROLE_LABEL } from '@/entities/user'
import type { UsersListSortKey } from '../types'

export const resolveUsersListSortValue = (user: User, key: UsersListSortKey): string => {
  switch (key) {
    case 'user':
      return user.name || user.login || ''
    case 'role':
      return ROLE_LABEL[user.role] || user.role
    case 'status':
      return user.active ? '1' : '0'
    case 'created':
      return user.createdAt || ''
  }
}
