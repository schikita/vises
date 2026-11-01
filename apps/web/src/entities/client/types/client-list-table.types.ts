import type { ClientListDto } from '@vises/contracts'

export type ClientListTableProps = {
  items: ClientListDto[]
  detailBasePath: string
  emptyTitle: string
  emptyText: string
}
