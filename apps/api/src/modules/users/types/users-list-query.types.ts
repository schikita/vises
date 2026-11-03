/** Users list sort keys matching staff UI + agent metrics (REQ-007 / DEC-P17). */
export type UsersListSortKey =
  | 'user'
  | 'name'
  | 'role'
  | 'status'
  | 'created'
  | 'currentBalance'
  | 'clientsCount'
  | 'totalRevenue';

export type UsersListSortDir = 'asc' | 'desc';

/** Normalized users list query after clamp/parse. */
export type UsersListQuery = {
  page: number;
  pageSize: number;
  q: string;
  role: string;
  sort: UsersListSortKey | null;
  sortDir: UsersListSortDir;
};
