import { useTranslation } from 'react-i18next'
import { Btn, DateRangePicker, Field } from '@/shared/ui'
import { ANALYTICS_RANGE_MODE } from '../../constants'
import type { AnalyticsDateRangeFiltersRenderProps } from '../../types'

export const AnalyticsDateRangeFiltersRender = ({
  mode,
  from,
  to,
  onModeChange,
  onFromChange,
  onToChange,
  onApply,
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
        <div
          className="rounded-panel border border-border bg-surface-muted/60 p-4 shadow-elevated"
          role="group"
          aria-label={t('analytics.filters.rangePanelAriaLabel')}
        >
          <Field label={t('analytics.filters.rangePickerLabel')}>
            <DateRangePicker
              from={from}
              to={to}
              onFromChange={onFromChange}
              onToChange={onToChange}
              placeholder={t('analytics.filters.rangePickerPlaceholder')}
              ariaLabel={t('analytics.filters.rangePickerAriaLabel')}
              presetLabels={{
                last7Days: t('analytics.filters.presetLast7Days'),
                thisMonth: t('analytics.filters.presetThisMonth'),
                thisYear: t('analytics.filters.presetThisYear'),
              }}
            />
          </Field>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-secondary">
              {t('analytics.filters.rangeHint')}
            </p>
            <Btn type="button" onClick={onApply}>
              {t('analytics.filters.apply')}
            </Btn>
          </div>
        </div>
      ) : (
        <p className="text-sm text-text-secondary">
          {t('analytics.filters.currentHint')}
        </p>
      )}
    </div>
  )
}
