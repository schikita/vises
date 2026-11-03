import { normalizePage, normalizePageSize } from '../../../shared/utils';
import type { BalanceTransactionsQueryParsed } from '../types/balance-transactions-query.types';

/** Parse optional ledger page/pageSize query values (DEC-P4). */
export const parseBalanceTransactionsQuery = (raw: {
  page?: string;
  pageSize?: string;
}): BalanceTransactionsQueryParsed => ({
  page: normalizePage(raw.page),
  pageSize: normalizePageSize(raw.pageSize),
});
