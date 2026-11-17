import type { ReactNode } from 'react'
import type { IssuedAccess, Role, UserListItem } from '@/entities/user'
import type { UsersListSortKey, UsersListSortState } from './users-list.types'

export type SortIconProps = {
  active: boolean
  dir: UsersListSortState['dir']
}

export type UsersRenderProps = {
  pageItems: UserListItem[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  listError: string
  createForm: ReactNode
  createOpen: boolean
  selectedUser: UserListItem | null
  issued: IssuedAccess | null
  copied: boolean
  q: string
  roleFilter: Role | 'all'
  sort: UsersListSortState
  onOpenCreate: () => void
  onCloseCreate: () => void
  onCloseUserDetail: () => void
  onQueryChange: (q: string) => void
  onRoleFilterChange: (role: Role | 'all') => void
  onSortChange: (key: UsersListSortKey) => void
  onPageChange: (page: number) => void
  onRowActivate: (user: UserListItem) => void
  onOpenLatestApp: (appId: string) => void
  onCopyLink: (token: string) => void
  onCopyCredentials: (issued: IssuedAccess) => void
  actorRole: Role | undefined
  actorId: string | undefined
  statusBusy: boolean
  statusError: string
  onSetActive: (userId: string, active: boolean) => void
}
