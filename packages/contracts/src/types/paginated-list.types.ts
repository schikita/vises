/**
 * Shared offset-pagination envelope (qa-polish DEC-P1).
 * Matches API `PaginatedList`: `{ items, total, page, pageSize }`.
 */
export type PaginatedList<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
