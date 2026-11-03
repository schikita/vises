import type { ClientsListSortBy } from '@vises/contracts'

export const CLIENT_LIST_SORT_COLUMNS: Array<{
  key: ClientsListSortBy
  labelKey: `clients.list.columns.${'name' | 'agent' | 'route' | 'status' | 'createdAt'}`
  requiresAgentColumn: boolean
}> = [
  {
    key: 'firstName',
    labelKey: 'clients.list.columns.name',
    requiresAgentColumn: false,
  },
  {
    key: 'agentName',
    labelKey: 'clients.list.columns.agent',
    requiresAgentColumn: true,
  },
  {
    key: 'route',
    labelKey: 'clients.list.columns.route',
    requiresAgentColumn: false,
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
