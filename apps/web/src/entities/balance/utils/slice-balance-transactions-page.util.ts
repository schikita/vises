import type { BalanceTransactionDto } from '@vises/contracts'

/** Slice ledger rows for ListPager. */
export const sliceBalanceTransactionsPage = (
  rows: BalanceTransactionDto[],
  page: number,
  pageSize: number,
): BalanceTransactionDto[] => {
  const start = (page - 1) * pageSize
  return rows.slice(start, start + pageSize)
}
