import type { Application } from '@/entities/application'
import type { VisitsListSortKey, VisitsListSortState } from './visits-list.types'

export type VisitsSortIconProps = {
  active: boolean
  dir: VisitsListSortState['dir']
}

export type VisitsRenderProps = {
  visits: Application[]
  total: number
  cities: string[]
  city: string
  from: string
  to: string
  q: string
  sort: VisitsListSortState
  page: number
  pageSize: number
  loading: boolean
  error: string
  onCityChange: (city: string) => void
  onFromChange: (from: string) => void
  onToChange: (to: string) => void
  onQueryChange: (q: string) => void
  onSortChange: (key: VisitsListSortKey) => void
  onPageChange: (page: number) => void
  onRowActivate: (appId: string) => void
}
