import type { UsersListSortKey } from '../types'

export const USERS_LIST_SORT_COLUMNS: Array<{
  key: UsersListSortKey
  label: string
  thClassName: string
}> = [
  { key: 'user', label: 'Пользователь', thClassName: 'w-[42%]' },
  { key: 'role', label: 'Роль', thClassName: 'w-[16%]' },
  { key: 'status', label: 'Статус', thClassName: 'w-[16%]' },
  { key: 'created', label: 'Создан', thClassName: 'w-[26%]' },
]

export const USERS_PAGE_TITLE = 'Пользователи'

export const USERS_EMPTY_TITLE = 'Никого нет'

export const USERS_EMPTY_TEXT =
  'Нажмите «Новый пользователь», чтобы создать доступ сотруднику (не клиенту).'

export const USERS_LOADING_TEXT = 'Получаем список пользователей.'
