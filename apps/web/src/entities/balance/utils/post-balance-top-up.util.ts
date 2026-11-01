import type { BalanceTopUpDto, BalanceTransactionDto } from '@vises/contracts'
import { apiRequest } from '@/shared/api'

/** POST /agents/:agentId/balance/top-up → ledger row (FR-7 / AC-10). */
export const postBalanceTopUp = (
  agentId: string,
  body: BalanceTopUpDto,
): Promise<BalanceTransactionDto> =>
  apiRequest<BalanceTransactionDto>(
    `/agents/${encodeURIComponent(agentId)}/balance/top-up`,
    {
      method: 'POST',
      data: body,
    },
  )
