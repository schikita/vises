import type { ClientsListSortBy } from './clients-list-sort-by.types'
import type { ClientsListSortDir } from './clients-list-sort-dir.types'

/** SPA clients-list controls (filter/sort/page applied client-side). */
export type ClientsListQuery = {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: ClientsListSortBy
  sortDir?: ClientsListSortDir
}
