import { normalizePage, normalizePageSize } from '../../../shared/utils';
import type { AnalyticsPagination } from '../types';

/** Parse optional analytics page/pageSize query values (DEC-P2). */
export const parseAnalyticsPagination = (raw: {
  page?: string | number;
  pageSize?: string | number;
}): AnalyticsPagination => ({
  page: normalizePage(raw.page),
  pageSize: normalizePageSize(raw.pageSize),
});
