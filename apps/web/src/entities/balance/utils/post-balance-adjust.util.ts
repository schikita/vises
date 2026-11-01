import type { BalanceAdjustDto, BalanceTransactionDto } from '@vises/contracts'
import { apiRequest } from '@/shared/api'

/** POST /agents/:agentId/balance/adjust → ledger row (FR-7 / AC-10). */
export const postBalanceAdjust = (
  agentId: string,
  body: BalanceAdjustDto,
): Promise<BalanceTransactionDto> =>
  apiRequest<BalanceTransactionDto>(
    `/agents/${encodeURIComponent(agentId)}/balance/adjust`,
    {
      method: 'POST',
      data: body,
    },
  )
