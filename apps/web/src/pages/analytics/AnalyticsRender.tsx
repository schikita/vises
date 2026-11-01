import { useTranslation } from 'react-i18next'
import { Card, Empty } from '@/shared/ui'
import type { AnalyticsRenderProps } from './types'

export const AnalyticsRender = ({
  loading,
  loadError,
  filters,
  report,
  data,
}: AnalyticsRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          {t('analytics.title')}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{t('analytics.subtitle')}</p>
      </div>

      <Card className="space-y-3">{filters}</Card>

      {loadError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {loadError}
        </p>
      ) : null}

      {loading ? (
        <Empty
          title={t('analytics.loadingTitle')}
          text={t('analytics.loadingText')}
        />
      ) : null}

      {!loading && !loadError && data === null ? (
        <Empty
          title={t('analytics.empty.title')}
          text={t('analytics.empty.text')}
        />
      ) : null}

      {!loading && !loadError && data !== null ? report : null}
    </div>
  )
}
