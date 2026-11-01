import type { AnalyticsRangeMode } from './analytics-range-mode.types'

export type AnalyticsDateRangeFiltersRenderProps = {
  mode: AnalyticsRangeMode
  from: string
  to: string
  onModeChange: (mode: AnalyticsRangeMode) => void
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}
