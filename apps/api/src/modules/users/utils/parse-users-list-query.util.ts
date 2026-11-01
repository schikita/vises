import { normalizePage, normalizePageSize } from '../../../shared/utils';
import { USERS_LIST_SORT_KEYS } from '../constants/users-list-sort.constants';
import type {
  UsersListQuery,
  UsersListSortDir,
  UsersListSortKey,
} from '../types/users-list-query.types';
import { normalizeUsersListRoleFilter } from './normalize-users-list-role-filter.util';

/** Parse raw query strings into a clamped users list query. */
export const parseUsersListQuery = (raw: {
  page?: string;
  pageSize?: string;
  q?: string;
  role?: string;
  sort?: string;
  sortDir?: string;
}): UsersListQuery => {
  const sortRaw = (raw.sort ?? '').trim();
  const sort = (USERS_LIST_SORT_KEYS as readonly string[]).includes(sortRaw)
    ? (sortRaw as UsersListSortKey)
    : null;
  const sortDirRaw = (raw.sortDir ?? '').trim().toLowerCase();
  const sortDir: UsersListSortDir =
    sortDirRaw === 'asc' || sortDirRaw === 'desc' ? sortDirRaw : 'asc';

  return {
    page: normalizePage(raw.page),
    pageSize: normalizePageSize(raw.pageSize),
    q: (raw.q ?? '').trim(),
    role: normalizeUsersListRoleFilter(raw.role ?? ''),
    sort,
    sortDir,
  };
};
