import type { ClientsListSortBy } from '../types/clients-list-sort-by.types'

export const CLIENT_LIST_SORT_COLUMNS: Array<{
  key: ClientsListSortBy
  labelKey: `clients.list.columns.${'name' | 'agent' | 'status' | 'createdAt'}`
  requiresAgentColumn: boolean
}> = [
  {
    key: 'firstName',
    labelKey: 'clients.list.columns.name',
    requiresAgentColumn: false,
  },
  {
    key: 'agentId',
    labelKey: 'clients.list.columns.agent',
    requiresAgentColumn: true,
  },
  {
    key: 'status',
    labelKey: 'clients.list.columns.status',
    requiresAgentColumn: false,
  },
  {
    key: 'createdAt',
    labelKey: 'clients.list.columns.createdAt',
    requiresAgentColumn: false,
  },
]
