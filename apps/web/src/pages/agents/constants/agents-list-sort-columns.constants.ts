import type { AgentsListSortKey } from '../types/agents-list-sort.types'

export const AGENTS_LIST_SORT_COLUMNS: Array<{
  key: AgentsListSortKey
  labelKey: `balance.agents.columns.${'agent' | 'clientsCount' | 'currentBalance' | 'totalRevenue'}`
}> = [
  { key: 'name', labelKey: 'balance.agents.columns.agent' },
  { key: 'clientsCount', labelKey: 'balance.agents.columns.clientsCount' },
  { key: 'currentBalance', labelKey: 'balance.agents.columns.currentBalance' },
  { key: 'totalRevenue', labelKey: 'balance.agents.columns.totalRevenue' },
]
