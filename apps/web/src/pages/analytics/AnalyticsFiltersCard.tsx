import type { ReactElement } from 'react'
import { Btn, Card, DateRangePicker, Field } from '@/shared/ui'
import { ANALYTICS_COPY, ANALYTICS_RANGE_MODE } from './constants'
import type { AnalyticsFiltersCardProps } from './types'

export const AnalyticsFiltersCard = ({
  mode,
  from,
  to,
  onModeChange,
  onFromChange,
  onToChange,
  onApply,
}: AnalyticsFiltersCardProps): ReactElement => {
  const isRange = mode === ANALYTICS_RANGE_MODE.Range

  return (
    <Card>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={ANALYTICS_COPY.filtersModeAriaLabel}
      >
        <Btn
          type="button"
          variant={
            mode === ANALYTICS_RANGE_MODE.Current ? 'primary' : 'soft'
          }
          onClick={(): void => {
            onModeChange(ANALYTICS_RANGE_MODE.Current)
          }}
        >
          {ANALYTICS_COPY.filtersCurrentTotals}
        </Btn>
        <Btn
          type="button"
          variant={isRange ? 'primary' : 'soft'}
          onClick={(): void => {
            onModeChange(ANALYTICS_RANGE_MODE.Range)
          }}
        >
          {ANALYTICS_COPY.filtersDateRange}
        </Btn>
      </div>

      {isRange ? (
        <div className="mt-4">
          <Field label={ANALYTICS_COPY.filtersRangePickerLabel}>
            <DateRangePicker
              from={from}
              to={to}
              onFromChange={onFromChange}
              onToChange={onToChange}
              placeholder={ANALYTICS_COPY.filtersRangePickerPlaceholder}
              ariaLabel={ANALYTICS_COPY.filtersRangePickerAriaLabel}
              presetLabels={{
                last7Days: ANALYTICS_COPY.filtersPresetLast7Days,
                thisMonth: ANALYTICS_COPY.filtersPresetThisMonth,
                thisYear: ANALYTICS_COPY.filtersPresetThisYear,
              }}
            />
          </Field>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">{ANALYTICS_COPY.filtersRangeHint}</p>
            <Btn type="button" onClick={onApply}>
              {ANALYTICS_COPY.filtersApply}
            </Btn>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">
          {ANALYTICS_COPY.filtersCurrentHint}
        </p>
      )}
    </Card>
  )
}
