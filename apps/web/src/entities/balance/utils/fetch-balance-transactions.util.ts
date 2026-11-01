import type { BalanceTransactionDto } from '@vises/contracts'
import { apiRequest } from '@/shared/api'

/** GET /agents/:agentId/balance/transactions → newest-first ledger (FR-7 / FR-8). */
export const fetchBalanceTransactions = (
  agentId: string,
): Promise<BalanceTransactionDto[]> =>
  apiRequest<BalanceTransactionDto[]>(
    `/agents/${encodeURIComponent(agentId)}/balance/transactions`,
  )
