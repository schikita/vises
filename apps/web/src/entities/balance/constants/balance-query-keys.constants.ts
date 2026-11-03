import type { BalanceTransactionsQuery } from '@vises/contracts'

/** TanStack Query keys for agent balance / ledger (FE8 / AC-10 / AC-11 / FE17). */
export const BALANCE_QUERY_KEYS = {
  all: ['balance'] as const,
  transactions: (agentId: string, query: BalanceTransactionsQuery = {}) =>
    [
      ...BALANCE_QUERY_KEYS.all,
      'transactions',
      agentId,
      query.page ?? null,
      query.pageSize ?? null,
    ] as const,
} as const
