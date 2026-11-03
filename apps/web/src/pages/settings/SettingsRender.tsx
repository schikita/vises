import { useTranslation } from 'react-i18next'
import { Card, Empty } from '@/shared/ui'
import type { SettingsRenderProps } from './types'

export const SettingsRender = ({
  loading,
  loadError,
  priceForm,
  currentPrice,
}: SettingsRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
        {t('settingsPrice.title')}
      </h1>
      <p className="mt-1 text-sm text-text-secondary">{t('settingsPrice.subtitle')}</p>

      {loadError ? (
        <p className="mt-4 text-sm font-medium text-danger" role="alert">
          {loadError}
        </p>
      ) : null}

      {loading ? (
        <Empty
          title={t('settingsPrice.loadingTitle')}
          text={t('settingsPrice.loadingText')}
        />
      ) : null}

      {!loading && !loadError ? (
        <Card className="mt-5 space-y-4 rounded-panel border border-border bg-surface px-5 py-5">
          <div>
            <p className="font-semibold text-text-primary">
              {t('settingsPrice.cardTitle')}
            </p>
            {currentPrice ? (
              <p className="mt-1 text-sm text-text-secondary">
                {t('settingsPrice.currentPrice', { price: currentPrice })}
              </p>
            ) : null}
          </div>
          {priceForm}
        </Card>
      ) : null}
    </div>
  )
}
