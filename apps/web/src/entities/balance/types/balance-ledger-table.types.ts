import type { BalanceTransactionDto } from '@vises/contracts'

export type BalanceLedgerTableProps = {
  items: BalanceTransactionDto[]
  emptyTitle: string
  emptyText: string
}
