import type {
  ClientsListSortBy,
  ClientsListSortDir,
} from '@vises/contracts';
import { normalizePage, normalizePageSize } from '../../../shared/utils';
import {
  CLIENTS_LIST_SORT_KEYS,
  DEFAULT_CLIENTS_LIST_SORT_BY,
  DEFAULT_CLIENTS_LIST_SORT_DIR,
} from '../constants/clients-list-sort.constants';
import type { ClientsListQueryParsed } from '../types/clients-list-query.types';

/** Parse raw clients list query into clamped pagination + allowlisted sort. */
export const parseClientsListQuery = (raw: {
  page?: string;
  pageSize?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
}): ClientsListQueryParsed => {
  const sortRaw = (raw.sortBy ?? '').trim();
  const sortBy = (CLIENTS_LIST_SORT_KEYS as readonly string[]).includes(sortRaw)
    ? (sortRaw as ClientsListSortBy)
    : DEFAULT_CLIENTS_LIST_SORT_BY;

  const sortDirRaw = (raw.sortDir ?? '').trim().toLowerCase();
  const sortDir: ClientsListSortDir =
    sortDirRaw === 'asc' || sortDirRaw === 'desc'
      ? sortDirRaw
      : DEFAULT_CLIENTS_LIST_SORT_DIR;

  return {
    page: normalizePage(raw.page),
    pageSize: normalizePageSize(raw.pageSize),
    search: (raw.search ?? '').trim(),
    sortBy,
    sortDir,
  };
};
