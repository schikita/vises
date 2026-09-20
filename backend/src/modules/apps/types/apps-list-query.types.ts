/** Apps list sort keys matching staff UI (owner-list-pagination REQ-006). */
export type AppsListSortKey =
  | 'name'
  | 'category'
  | 'city'
  | 'status'
  | 'travelDate';

export type AppsListSortDir = 'asc' | 'desc';

/** Normalized apps list query after clamp/parse. */
export type AppsListQuery = {
  page: number;
  pageSize: number;
  q: string;
  status: string;
  city: string;
  sort: AppsListSortKey | null;
  sortDir: AppsListSortDir;
};
