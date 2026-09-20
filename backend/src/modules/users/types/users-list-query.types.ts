/** Users list sort keys matching staff UI (REQ-007). */
export type UsersListSortKey = 'user' | 'role' | 'status' | 'created';

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
