/** TanStack Query keys for agent balance / ledger (FE8 / AC-10 / AC-11). */
export const BALANCE_QUERY_KEYS = {
  all: ['balance'] as const,
  transactions: (agentId: string) =>
    [...BALANCE_QUERY_KEYS.all, 'transactions', agentId] as const,
} as const
