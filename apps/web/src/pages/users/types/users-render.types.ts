import type { ReactNode } from 'react'
import type { IssuedAccess, UserListItem } from '@/entities/user'
import type { UsersConfirmAction } from './users-confirm-action.types'
import type { UsersListSortKey, UsersListSortState } from './users-list.types'
import type { UsersRoleFilter } from './users-role-filter.types'

export type UsersRenderProps = {
  pageItems: UserListItem[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  listError: string
  actionError: string
  createForm: ReactNode
  createOpen: boolean
  canOpenCreate: boolean
  issued: IssuedAccess | null
  q: string
  roleFilter: UsersRoleFilter
  sort: UsersListSortState
  rowMessage: string
  sessionUserId?: string
  mutating: boolean
  confirmAction: UsersConfirmAction | null
  canMutateTarget: (targetRole: UserListItem['role']) => boolean
  onOpenCreate: () => void
  onCloseCreate: () => void
  onQueryChange: (q: string) => void
  onRoleFilterChange: (role: UsersRoleFilter) => void
  onSortChange: (key: UsersListSortKey) => void
  onPageChange: (page: number) => void
  onRowActivate: (user: UserListItem) => void
  onCopyCredentials: (issued: IssuedAccess) => void
  onRequestConfirm: (action: UsersConfirmAction) => void
  onCancelConfirm: () => void
  onApplyConfirm: () => void
}
