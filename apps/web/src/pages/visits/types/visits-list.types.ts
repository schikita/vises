export type VisitsListSortKey =
  | 'applicant'
  | 'city'
  | 'date'
  | 'time'
  | 'place'
  | 'created'

export type VisitsListSortDir = 'asc' | 'desc'

export type VisitsListSortState = {
  key: VisitsListSortKey
  dir: VisitsListSortDir
}
