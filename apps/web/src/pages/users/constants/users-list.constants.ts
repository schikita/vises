import type { Role } from '@/entities/user'
import type { UsersListSortKey } from '../types'

export const USERS_LIST_SORT_COLUMNS: Array<{
  key: UsersListSortKey
  labelKey: `usersAdmin.columns.${UsersListSortKey}`
}> = [
  { key: 'user', labelKey: 'usersAdmin.columns.user' },
  { key: 'role', labelKey: 'usersAdmin.columns.role' },
  { key: 'status', labelKey: 'usersAdmin.columns.status' },
  { key: 'created', labelKey: 'usersAdmin.columns.created' },
]

export const USERS_ROLE_FILTER_OPTIONS: Role[] = ['superadmin', 'admin', 'agent']
