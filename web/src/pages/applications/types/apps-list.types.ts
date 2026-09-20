export type AppsListSortKey = 'name' | 'category' | 'city' | 'status' | 'travelDate'

export type AppsListSortDir = 'asc' | 'desc'

export type AppsListSortState = {
  key: AppsListSortKey
  dir: AppsListSortDir
}
