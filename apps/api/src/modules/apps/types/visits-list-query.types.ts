/** Visits list sort keys matching staff UI (REQ-008). */
export type VisitsListSortKey =
  | 'applicant'
  | 'city'
  | 'date'
  | 'time'
  | 'place'
  | 'created';

export type VisitsListSortDir = 'asc' | 'desc';

/** Normalized visits list query after clamp/parse. */
export type VisitsListQuery = {
  page: number;
  pageSize: number;
  q: string;
  city: string;
  /** Inclusive visit_date lower bound `YYYY-MM-DD`, or null when unset. */
  from: string | null;
  /** Inclusive visit_date upper bound `YYYY-MM-DD`, or null when unset. */
  to: string | null;
  sort: VisitsListSortKey | null;
  sortDir: VisitsListSortDir;
};
