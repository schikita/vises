import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { BalanceTransactionDto, UserMeDto } from '@vises/contracts'
import {
  BALANCE_QUERY_KEYS,
  BalanceLedgerTable,
  ZERO_BALANCE_DISPLAY,
  fetchBalanceTransactions,
  sliceBalanceTransactionsPage,
} from '@/entities/balance'
import { useSession } from '@/entities/session'
import { fetchAuthMe, resolveApiErrorI18nKey } from '@/shared/api'
import { STAFF_LIST_PAGE_SIZE } from '@/shared/lib'
import { BalanceRender } from './BalanceRender'

/**
 * Agent `/app/balance` — own balance card + ledger only (FE8 / AC-11).
 * Never mounts top-up or adjust controls.
 */
export const BalancePage = (): React.ReactElement => {
  const { t } = useTranslation()
  const { session } = useSession()
  const agentId = session?.userId ?? ''
  const [ledgerPage, setLedgerPage] = useState(1)
  const pageSize = STAFF_LIST_PAGE_SIZE

  const meQuery = useQuery({
    queryKey: [...BALANCE_QUERY_KEYS.all, 'me'] as const,
    queryFn: (): Promise<UserMeDto> => fetchAuthMe(),
    enabled: Boolean(agentId),
  })

  const ledgerQuery = useQuery({
    queryKey: BALANCE_QUERY_KEYS.transactions(agentId),
    queryFn: (): Promise<BalanceTransactionDto[]> =>
      fetchBalanceTransactions(agentId),
    enabled: Boolean(agentId),
  })

  const loadError =
    meQuery.isError || ledgerQuery.isError
      ? t(
          resolveApiErrorI18nKey(
            meQuery.error ?? ledgerQuery.error ?? new Error('unknown'),
          ),
        )
      : ''

  const loading = meQuery.isLoading || ledgerQuery.isLoading
  const allItems = ledgerQuery.data ?? []
  const pageItems = sliceBalanceTransactionsPage(allItems, ledgerPage, pageSize)

  const currentBalance =
    meQuery.data?.balance ??
    (meQuery.isSuccess ? ZERO_BALANCE_DISPLAY : null)

  const ledger: ReactNode =
    ledgerQuery.data !== undefined ? (
      <BalanceLedgerTable
        items={pageItems}
        emptyTitle={t('balance.ledger.emptyTitle')}
        emptyText={t('balance.ledger.emptyText')}
      />
    ) : null

  return (
    <BalanceRender
      loading={loading}
      loadError={loadError}
      currentBalance={currentBalance}
      ledger={ledger}
      ledgerPage={ledgerPage}
      ledgerPageSize={pageSize}
      ledgerTotal={allItems.length}
      onLedgerPageChange={setLedgerPage}
    />
  )
}
