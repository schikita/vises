import { useTranslation } from 'react-i18next'
import { Btn, Field } from '@/shared/ui'
import { ANALYTICS_RANGE_MODE } from '../../constants'
import type { AnalyticsDateRangeFiltersRenderProps } from '../../types'

export const AnalyticsDateRangeFiltersRender = ({
  mode,
  from,
  to,
  onModeChange,
  onFromChange,
  onToChange,
}: AnalyticsDateRangeFiltersRenderProps): React.ReactElement => {
  const { t } = useTranslation()
  const isRange = mode === ANALYTICS_RANGE_MODE.Range

  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={t('analytics.filters.modeAriaLabel')}
      >
        <Btn
          type="button"
          variant={mode === ANALYTICS_RANGE_MODE.Current ? 'primary' : 'soft'}
          onClick={(): void => {
            onModeChange(ANALYTICS_RANGE_MODE.Current)
          }}
        >
          {t('analytics.filters.currentTotals')}
        </Btn>
        <Btn
          type="button"
          variant={isRange ? 'primary' : 'soft'}
          onClick={(): void => {
            onModeChange(ANALYTICS_RANGE_MODE.Range)
          }}
        >
          {t('analytics.filters.dateRange')}
        </Btn>
      </div>

      {isRange ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('analytics.filters.fromLabel')}>
            <input
              type="date"
              className="field"
              value={from}
              onChange={(event): void => {
                onFromChange(event.target.value)
              }}
              aria-label={t('analytics.filters.fromLabel')}
            />
          </Field>
          <Field label={t('analytics.filters.toLabel')}>
            <input
              type="date"
              className="field"
              value={to}
              onChange={(event): void => {
                onToChange(event.target.value)
              }}
              aria-label={t('analytics.filters.toLabel')}
            />
          </Field>
        </div>
      ) : (
        <p className="text-sm text-text-secondary">
          {t('analytics.filters.currentHint')}
        </p>
      )}

      {isRange ? (
        <p className="text-sm text-text-secondary">
          {t('analytics.filters.rangeHint')}
        </p>
      ) : null}
    </div>
  )
}
