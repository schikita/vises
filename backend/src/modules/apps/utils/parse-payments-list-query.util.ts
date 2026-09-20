import { normalizePage, normalizePageSize } from '../../../shared/utils';
import type { PaymentsListQuery } from '../types/payments-list-query.types';

/** Parse raw query strings into a clamped payments list query. */
export const parsePaymentsListQuery = (raw: {
  page?: string;
  pageSize?: string;
}): PaymentsListQuery => ({
  page: normalizePage(raw.page),
  pageSize: normalizePageSize(raw.pageSize),
});
