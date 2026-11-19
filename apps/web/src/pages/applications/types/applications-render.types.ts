import type { ApplicationStatus } from '@vises/contracts'
import type { AppsListSortKey, AppsListSortState } from './apps-list.types'
import type { ApplicationsListRow } from './applications-list-row.types'

export type ApplicationsRenderProps = {
  filteredCount: number
  pageItems: ApplicationsListRow[]
  cities: string[]
  q: string
  status: ApplicationStatus | 'all'
  city: string
  page: number
  pageSize: number
  sort: AppsListSortState
  loading: boolean
  error: string
  notice: string
  appsBase: string
  clientsBase: string
  createCtaTo: string | null
  createCtaLabel: string
  onQueryChange: (q: string) => void
  onStatusChange: (status: ApplicationStatus | 'all') => void
  onCityChange: (city: string) => void
  onPageChange: (page: number) => void
  onSortChange: (key: AppsListSortKey) => void
}
