import type { UsersListSortKey } from '../types'

export const USERS_LIST_SORT_COLUMNS: Array<{ key: UsersListSortKey; label: string }> = [
  { key: 'user', label: 'Пользователь' },
  { key: 'role', label: 'Роль' },
  { key: 'status', label: 'Статус' },
  { key: 'created', label: 'Создан' },
]

export const USERS_NO_APPS_MESSAGE = 'У этого пользователя пока нет заявок.'
