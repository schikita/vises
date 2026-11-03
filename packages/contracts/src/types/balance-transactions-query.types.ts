/**
 * Query for `GET /agents/:agentId/balance/transactions` (qa-polish DEC-P4).
 * Default sort remains newest-first; pagination only.
 */
export type BalanceTransactionsQuery = {
  page?: number;
  pageSize?: number;
};
