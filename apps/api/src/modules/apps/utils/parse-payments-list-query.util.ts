import { normalizePage, normalizePageSize } from '../../../shared/utils';
import { PAYMENTS_LIST_SORT_KEYS } from '../constants/payments-list-sort.constants';
import type {
  PaymentsListQuery,
  PaymentsListSortDir,
  PaymentsListSortKey,
} from '../types/payments-list-query.types';

/** Parse raw query strings into a clamped payments list query. */
export const parsePaymentsListQuery = (raw: {
  page?: string;
  pageSize?: string;
  sort?: string;
  sortDir?: string;
}): PaymentsListQuery => {
  const sortRaw = (raw.sort ?? '').trim();
  const sort = (PAYMENTS_LIST_SORT_KEYS as readonly string[]).includes(sortRaw)
    ? (sortRaw as PaymentsListSortKey)
    : null;
  const sortDirRaw = (raw.sortDir ?? '').trim().toLowerCase();
  const sortDir: PaymentsListSortDir =
    sortDirRaw === 'asc' || sortDirRaw === 'desc' ? sortDirRaw : 'desc';

  return {
    page: normalizePage(raw.page),
    pageSize: normalizePageSize(raw.pageSize),
    sort,
    sortDir,
  };
};
