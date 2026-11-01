import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BalanceAmountCard } from '@/entities/balance'
import { Card, Empty } from '@/shared/ui'
import type { AgentBalanceRenderProps } from './types'

export const AgentBalanceRender = ({
  agentName,
  agentLogin,
  loading,
  loadError,
  currentBalance,
  topUpForm,
  adjustForm,
  ledger,
}: AgentBalanceRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/agents"
          className="text-sm font-medium text-forest no-underline hover:underline"
        >
          {t('balance.agentDetail.back')}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
          {t('balance.agentDetail.title', { name: agentName })}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t('balance.agentDetail.subtitle', { login: agentLogin })}
        </p>
      </div>

      {loadError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {loadError}
        </p>
      ) : null}

      {loading ? (
        <Empty
          title={t('balance.agentDetail.loadingTitle')}
          text={t('balance.agentDetail.loadingText')}
        />
      ) : null}

      {!loading && currentBalance !== null ? (
        <BalanceAmountCard
          title={t('balance.currentTitle')}
          amount={currentBalance}
          hint={t('balance.currentHint')}
        />
      ) : null}

      {!loading && !loadError ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="font-semibold text-text-primary">{t('balance.topUp.title')}</h2>
            {topUpForm}
          </Card>
          <Card className="space-y-3">
            <h2 className="font-semibold text-text-primary">{t('balance.adjust.title')}</h2>
            {adjustForm}
          </Card>
        </div>
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
