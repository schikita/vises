/** Payments list sort keys matching staff UI. */
export type PaymentsListSortKey =
  | 'app'
  | 'amount'
  | 'status'
  | 'note'
  | 'created';

export type PaymentsListSortDir = 'asc' | 'desc';

/** Normalized payments list query after clamp/parse. */
export type PaymentsListQuery = {
  page: number;
  pageSize: number;
  sort: PaymentsListSortKey | null;
  sortDir: PaymentsListSortDir;
};
