export type UsersListSortKey = 'user' | 'role' | 'status' | 'created'

export type UsersListSortDir = 'asc' | 'desc'

export type UsersListSortState = {
  key: UsersListSortKey
  dir: UsersListSortDir
}
