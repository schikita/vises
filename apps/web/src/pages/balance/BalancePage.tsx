import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type {
  BalanceTransactionsListDto,
  UserMeDto,
} from '@vises/contracts'
import {
  BALANCE_QUERY_KEYS,
  BalanceLedgerTable,
  ZERO_BALANCE_DISPLAY,
  fetchBalanceTransactions,
} from '@/entities/balance'
import { useSession } from '@/entities/session'
import { fetchAuthMe, resolveApiErrorI18nKey } from '@/shared/api'
import { STAFF_LIST_PAGE_SIZE } from '@/shared/lib'
import { BalanceRender } from './BalanceRender'

/**
 * Agent `/app/balance` — own balance card + ledger only (FE8 / AC-11 / FE17).
 * Never mounts top-up or adjust controls.
 */
export const BalancePage = (): React.ReactElement => {
  const { t } = useTranslation()
  const { session } = useSession()
  const agentId = session?.userId ?? ''
  const [ledgerPage, setLedgerPage] = useState(1)
  const ledgerParams = {
    page: ledgerPage,
    pageSize: STAFF_LIST_PAGE_SIZE,
  }

  const meQuery = useQuery({
    queryKey: [...BALANCE_QUERY_KEYS.all, 'me'] as const,
    queryFn: (): Promise<UserMeDto> => fetchAuthMe(),
    enabled: Boolean(agentId),
  })

  const ledgerQuery = useQuery({
    queryKey: BALANCE_QUERY_KEYS.transactions(agentId, ledgerParams),
    queryFn: (): Promise<BalanceTransactionsListDto> =>
      fetchBalanceTransactions(agentId, ledgerParams),
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

  const currentBalance =
    meQuery.data?.balance ??
    (meQuery.isSuccess ? ZERO_BALANCE_DISPLAY : null)

  const ledger: ReactNode =
    ledgerQuery.data !== undefined ? (
      <BalanceLedgerTable
        items={ledgerQuery.data.items}
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
      ledgerPage={ledgerQuery.data?.page ?? ledgerPage}
      ledgerPageSize={ledgerQuery.data?.pageSize ?? STAFF_LIST_PAGE_SIZE}
      ledgerTotal={ledgerQuery.data?.total ?? 0}
      onLedgerPageChange={setLedgerPage}
    />
  )
}
