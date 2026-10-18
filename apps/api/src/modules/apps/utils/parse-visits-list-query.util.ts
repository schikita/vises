import { normalizePage, normalizePageSize } from '../../../shared/utils';
import { VISITS_LIST_SORT_KEYS } from '../constants/visits-list-sort.constants';
import type {
  VisitsFilterMode,
  VisitsListQuery,
  VisitsListSortDir,
  VisitsListSortKey,
} from '../types/visits-list-query.types';

/** Parse raw query strings into a clamped visits list query. */
export const parseVisitsListQuery = (raw: {
  page?: string;
  pageSize?: string;
  q?: string;
  city?: string;
  mode?: string;
  sort?: string;
  sortDir?: string;
}): VisitsListQuery => {
  const sortRaw = (raw.sort ?? '').trim();
  const sort = (VISITS_LIST_SORT_KEYS as readonly string[]).includes(sortRaw)
    ? (sortRaw as VisitsListSortKey)
    : null;
  const sortDirRaw = (raw.sortDir ?? '').trim().toLowerCase();
  const sortDir: VisitsListSortDir =
    sortDirRaw === 'asc' || sortDirRaw === 'desc' ? sortDirRaw : 'asc';
  const modeRaw = (raw.mode ?? '').trim().toLowerCase();
  const mode: VisitsFilterMode =
    modeRaw === 'all' || modeRaw === 'upcoming' ? modeRaw : 'upcoming';

  return {
    page: normalizePage(raw.page),
    pageSize: normalizePageSize(raw.pageSize),
    q: (raw.q ?? '').trim(),
    city: (raw.city ?? '').trim(),
    mode,
    sort,
    sortDir,
    todayIsoDate: new Date().toISOString().slice(0, 10),
  };
};
