import { useState, type ReactNode } from 'react'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type {
  BalanceTransactionDto,
  BalanceTransactionsListDto,
} from '@vises/contracts'
import {
  BALANCE_QUERY_KEYS,
  BalanceLedgerTable,
  fetchBalanceTransactions,
  postBalanceAdjust,
  postBalanceTopUp,
  resolveCurrentBalanceFromLedger,
} from '@/entities/balance'
import { homePath, useSession } from '@/entities/session'
import { BalanceAdjustForm } from '@/features/balance-adjust'
import { BalanceTopUpForm } from '@/features/balance-top-up'
import {
  ENTITY_GONE_I18N_KEYS,
  isEntityGoneError,
  redirectIfEntityGone,
  resolveApiErrorI18nKey,
  useEntityGoneRedirect,
} from '@/shared/api'
import { STAFF_LIST_PAGE_SIZE } from '@/shared/lib'
import { AgentBalanceRender } from './AgentBalanceRender'
import type { AgentBalanceLocationState } from './types'

/** Staff per-agent balance: top-up, adjust, ledger (FE8 / AC-10 / FE17). */
export const AgentBalancePage = (): React.ReactElement => {
  const { agentId = '' } = useParams<{ agentId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const locationState = (location.state ?? null) as AgentBalanceLocationState | null
  const { t } = useTranslation()
  const { session } = useSession()
  const queryClient = useQueryClient()
  const [topUpError, setTopUpError] = useState('')
  const [topUpSaved, setTopUpSaved] = useState(false)
  const [adjustError, setAdjustError] = useState('')
  const [adjustSaved, setAdjustSaved] = useState(false)
  const [ledgerPage, setLedgerPage] = useState(1)

  const role = session?.role
  const listPath = role ? `${homePath(role)}/agents` : '/admin/agents'
  const ledgerParams = {
    page: ledgerPage,
    pageSize: STAFF_LIST_PAGE_SIZE,
  }
  const balanceHeadParams = { page: 1, pageSize: 1 }

  const balanceHeadQuery = useQuery({
    queryKey: BALANCE_QUERY_KEYS.transactions(agentId, balanceHeadParams),
    queryFn: (): Promise<BalanceTransactionsListDto> =>
      fetchBalanceTransactions(agentId, balanceHeadParams),
    enabled: Boolean(agentId),
  })

  const ledgerQuery = useQuery({
    queryKey: BALANCE_QUERY_KEYS.transactions(agentId, ledgerParams),
    queryFn: (): Promise<BalanceTransactionsListDto> =>
      fetchBalanceTransactions(agentId, ledgerParams),
    enabled: Boolean(agentId),
    placeholderData: keepPreviousData,
  })

  useEntityGoneRedirect({
    error: ledgerQuery.error ?? balanceHeadQuery.error,
    enabled: ledgerQuery.isError || balanceHeadQuery.isError,
    queryKey: BALANCE_QUERY_KEYS.all,
    listPath,
    noticeI18nKey: ENTITY_GONE_I18N_KEYS.agent,
  })

  const invalidateLedger = (): Promise<void> =>
    queryClient.invalidateQueries({
      queryKey: BALANCE_QUERY_KEYS.all,
    })

  const topUpMutation = useMutation({
    mutationFn: (amount: string): Promise<BalanceTransactionDto> =>
      postBalanceTopUp(agentId, { amount }),
    onSuccess: async (): Promise<void> => {
      setTopUpError('')
      setTopUpSaved(true)
      setLedgerPage(1)
      await invalidateLedger()
    },
    onError: (err: unknown): void => {
      if (
        redirectIfEntityGone({
          error: err,
          queryClient,
          queryKey: BALANCE_QUERY_KEYS.all,
          navigate,
          listPath,
          noticeI18nKey: ENTITY_GONE_I18N_KEYS.agent,
        })
      ) {
        return
      }
      setTopUpSaved(false)
      setTopUpError(t(resolveApiErrorI18nKey(err)))
    },
  })

  const adjustMutation = useMutation({
    mutationFn: (input: {
      amount: string
      reason: string
    }): Promise<BalanceTransactionDto> => postBalanceAdjust(agentId, input),
    onSuccess: async (): Promise<void> => {
      setAdjustError('')
      setAdjustSaved(true)
      setLedgerPage(1)
      await invalidateLedger()
    },
    onError: (err: unknown): void => {
      if (
        redirectIfEntityGone({
          error: err,
          queryClient,
          queryKey: BALANCE_QUERY_KEYS.all,
          navigate,
          listPath,
          noticeI18nKey: ENTITY_GONE_I18N_KEYS.agent,
        })
      ) {
        return
      }
      setAdjustSaved(false)
      setAdjustError(t(resolveApiErrorI18nKey(err)))
    },
  })

  const loadError =
    (ledgerQuery.isError && !isEntityGoneError(ledgerQuery.error)) ||
    (balanceHeadQuery.isError && !isEntityGoneError(balanceHeadQuery.error))
      ? t(
          resolveApiErrorI18nKey(
            ledgerQuery.error ?? balanceHeadQuery.error ?? new Error('unknown'),
          ),
        )
      : ''

  const currentBalance =
    balanceHeadQuery.data !== undefined
      ? resolveCurrentBalanceFromLedger(balanceHeadQuery.data.items)
      : null

  const topUpForm: ReactNode = (
    <BalanceTopUpForm
      apiError={topUpError}
      saved={topUpSaved}
      pending={topUpMutation.isPending}
      onValidSubmit={async ({ amount }): Promise<boolean> => {
        setTopUpError('')
        setTopUpSaved(false)
        try {
          await topUpMutation.mutateAsync(amount)
          return true
        } catch {
          return false
        }
      }}
    />
  )

  const adjustForm: ReactNode = (
    <BalanceAdjustForm
      apiError={adjustError}
      saved={adjustSaved}
      pending={adjustMutation.isPending}
      onValidSubmit={async ({ amount, reason }): Promise<boolean> => {
        setAdjustError('')
        setAdjustSaved(false)
        try {
          await adjustMutation.mutateAsync({ amount, reason })
          return true
        } catch {
          return false
        }
      }}
    />
  )

  const ledger: ReactNode =
    ledgerQuery.data !== undefined ? (
      <BalanceLedgerTable
        items={ledgerQuery.data.items}
        emptyTitle={t('balance.ledger.emptyTitle')}
        emptyText={t('balance.ledger.emptyText')}
      />
    ) : null

  return (
    <AgentBalanceRender
      agentName={
        locationState?.agentName?.trim() || t('balance.agentDetail.unknownName')
      }
      agentLogin={locationState?.agentLogin?.trim() || agentId}
      loading={
        (ledgerQuery.isLoading && ledgerQuery.data === undefined) ||
        (balanceHeadQuery.isLoading && balanceHeadQuery.data === undefined)
      }
      loadError={loadError}
      currentBalance={currentBalance}
      topUpForm={topUpForm}
      adjustForm={adjustForm}
      ledger={ledger}
      ledgerPage={ledgerQuery.data?.page ?? ledgerPage}
      ledgerPageSize={ledgerQuery.data?.pageSize ?? STAFF_LIST_PAGE_SIZE}
      ledgerTotal={ledgerQuery.data?.total ?? 0}
      onLedgerPageChange={setLedgerPage}
    />
  )
}
