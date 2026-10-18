import { normalizePage, normalizePageSize } from '../../../shared/utils';
import { APPS_LIST_SORT_KEYS } from '../constants/apps-list-sort.constants';
import type {
  AppsListQuery,
  AppsListSortDir,
  AppsListSortKey,
} from '../types/apps-list-query.types';

/** Parse raw query strings into a clamped apps list query. */
export const parseAppsListQuery = (raw: {
  page?: string;
  pageSize?: string;
  q?: string;
  status?: string;
  city?: string;
  sort?: string;
  sortDir?: string;
}): AppsListQuery => {
  const sortRaw = (raw.sort ?? '').trim();
  const sort = (APPS_LIST_SORT_KEYS as readonly string[]).includes(sortRaw)
    ? (sortRaw as AppsListSortKey)
    : null;
  const sortDirRaw = (raw.sortDir ?? '').trim().toLowerCase();
  const sortDir: AppsListSortDir =
    sortDirRaw === 'asc' || sortDirRaw === 'desc' ? sortDirRaw : 'asc';

  return {
    page: normalizePage(raw.page),
    pageSize: normalizePageSize(raw.pageSize),
    q: (raw.q ?? '').trim(),
    status: (raw.status ?? '').trim(),
    city: (raw.city ?? '').trim(),
    sort,
    sortDir,
  };
};
