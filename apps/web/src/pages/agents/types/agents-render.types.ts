import type { UserListItem } from '@/entities/user'
import type { AgentsListSortKey, AgentsListSortState } from './agents-list-sort.types'

export type AgentsRenderProps = {
  agents: UserListItem[]
  loading: boolean
  listError: string
  notice: string
  empty: boolean
  total: number
  page: number
  pageSize: number
  q: string
  sort: AgentsListSortState
  onQueryChange: (value: string) => void
  onSortChange: (key: AgentsListSortKey) => void
  onPageChange: (page: number) => void
}
