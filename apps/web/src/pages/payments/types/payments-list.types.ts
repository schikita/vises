export type PaymentsListSortKey =
  | 'app'
  | 'amount'
  | 'status'
  | 'note'
  | 'created'

export type PaymentsListSortDir = 'asc' | 'desc'

export type PaymentsListSortState = {
  key: PaymentsListSortKey
  dir: PaymentsListSortDir
}
