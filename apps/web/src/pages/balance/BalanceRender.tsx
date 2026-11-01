import { useTranslation } from 'react-i18next'
import { BalanceAmountCard } from '@/entities/balance'
import { Empty } from '@/shared/ui'
import type { BalanceRenderProps } from './types'

/** Agent own balance + ledger (FE8 / AC-11) — no top-up/adjust controls. */
export const BalanceRender = ({
  loading,
  loadError,
  currentBalance,
  ledger,
}: BalanceRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          {t('balance.self.title')}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{t('balance.self.subtitle')}</p>
      </div>

      {loadError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {loadError}
        </p>
      ) : null}

      {loading ? (
        <Empty
          title={t('balance.self.loadingTitle')}
          text={t('balance.self.loadingText')}
        />
      ) : null}

      {!loading && currentBalance !== null ? (
        <BalanceAmountCard
          title={t('balance.currentTitle')}
          amount={currentBalance}
          hint={t('balance.self.currentHint')}
        />
      ) : null}

      {!loading && !loadError ? (
        <section className="space-y-3">
          <h2 className="font-semibold text-text-primary">{t('balance.ledger.title')}</h2>
          {ledger}
        </section>
      ) : null}
    </div>
  )
}
