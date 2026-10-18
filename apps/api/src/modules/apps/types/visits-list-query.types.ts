/** Visits list filter mode (parity with FE `VisitsFilterMode`). */
export type VisitsFilterMode = 'upcoming' | 'all';

/** Visits list sort keys matching staff UI (REQ-008). */
export type VisitsListSortKey =
  | 'applicant'
  | 'city'
  | 'date'
  | 'time'
  | 'place'
  | 'status';

export type VisitsListSortDir = 'asc' | 'desc';

/** Normalized visits list query after clamp/parse. */
export type VisitsListQuery = {
  page: number;
  pageSize: number;
  q: string;
  city: string;
  mode: VisitsFilterMode;
  sort: VisitsListSortKey | null;
  sortDir: VisitsListSortDir;
  /** ISO date `YYYY-MM-DD` (UTC slice) for upcoming filter. */
  todayIsoDate: string;
};
