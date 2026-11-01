import type { AnalyticsDateRangeFiltersProps } from '../../types'
import { AnalyticsDateRangeFiltersRender } from './AnalyticsDateRangeFiltersRender'

/** Current-totals vs receivedAt date-range toggle (AC-12a). */
export const AnalyticsDateRangeFilters = ({
  mode,
  from,
  to,
  onModeChange,
  onFromChange,
  onToChange,
}: AnalyticsDateRangeFiltersProps): React.ReactElement => (
  <AnalyticsDateRangeFiltersRender
    mode={mode}
    from={from}
    to={to}
    onModeChange={onModeChange}
    onFromChange={onFromChange}
    onToChange={onToChange}
  />
)
