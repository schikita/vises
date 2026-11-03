import type {
  BalanceTransactionsListDto,
  BalanceTransactionsQuery,
} from '@vises/contracts'
import { apiRequest } from '@/shared/api'
import { buildStaffListQuery } from '@/shared/lib'

/** GET /agents/:agentId/balance/transactions → paginated newest-first ledger. */
export const fetchBalanceTransactions = (
  agentId: string,
  query: BalanceTransactionsQuery = {},
): Promise<BalanceTransactionsListDto> =>
  apiRequest<BalanceTransactionsListDto>(
    `/agents/${encodeURIComponent(agentId)}/balance/transactions${buildStaffListQuery(
      {
        page: query.page,
        pageSize: query.pageSize,
      },
    )}`,
  )
