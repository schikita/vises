import type { ClientListDto } from '@vises/contracts'
import type { ClientsListSortBy } from './clients-list-sort-by.types'
import type { ClientsListSortDir } from './clients-list-sort-dir.types'

export type ClientListTableProps = {
  items: ClientListDto[]
  emptyTitle: string
  emptyText: string
  showAgentColumn: boolean
  sortBy: ClientsListSortBy
  sortDir: ClientsListSortDir
  onSortChange: (sortBy: ClientsListSortBy) => void
  onRowActivate: (clientId: string) => void
}
