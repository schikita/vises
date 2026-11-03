import type { AnalyticsDateRangeFiltersProps } from '../../types'
import { AnalyticsDateRangeFiltersRender } from './AnalyticsDateRangeFiltersRender'

/** Current-totals vs receivedAt date-range toggle with Apply (DEC-P10). */
export const AnalyticsDateRangeFilters = ({
  mode,
  from,
  to,
  onModeChange,
  onFromChange,
  onToChange,
  onApply,
}: AnalyticsDateRangeFiltersProps): React.ReactElement => (
  <AnalyticsDateRangeFiltersRender
    mode={mode}
    from={from}
    to={to}
    onModeChange={onModeChange}
    onFromChange={onFromChange}
    onToChange={onToChange}
    onApply={onApply}
  />
)
