import type { ClientListDto, ClientsListSortBy, ClientsListSortDir } from '@vises/contracts'

export type ClientListTableProps = {
  items: ClientListDto[]
  emptyTitle: string
  emptyText: string
  /** Admin/superadmin: show Agent column (DEC-P8). */
  showAgentColumn: boolean
  sortBy: ClientsListSortBy
  sortDir: ClientsListSortDir
  onSortChange: (sortBy: ClientsListSortBy) => void
  onRowActivate: (clientId: string) => void
}
