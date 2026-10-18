export type VisitsFilterMode = 'upcoming' | 'all'

export type VisitsListSortKey = 'applicant' | 'city' | 'date' | 'time' | 'place' | 'status'

export type VisitsListSortDir = 'asc' | 'desc'

export type VisitsListSortState = {
  key: VisitsListSortKey
  dir: VisitsListSortDir
}
