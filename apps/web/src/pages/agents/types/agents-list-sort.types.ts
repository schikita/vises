export type AgentsListSortKey =
  | 'name'
  | 'clientsCount'
  | 'currentBalance'
  | 'totalRevenue'

export type AgentsListSortDir = 'asc' | 'desc'

export type AgentsListSortState = {
  key: AgentsListSortKey
  dir: AgentsListSortDir
}
