import type { BalanceTransactionDto } from './balance.types';
import type { PaginatedList } from './paginated-list.types';

/**
 * Paginated balance ledger list response (qa-polish DEC-P1 / DEC-P4).
 * Items remain newest-first.
 */
export type BalanceTransactionsListDto = PaginatedList<BalanceTransactionDto>;
