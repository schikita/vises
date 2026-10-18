/** Offset pagination envelope (owner-list-pagination DEC-002 / DEC-003). */
export type PaginatedList<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
