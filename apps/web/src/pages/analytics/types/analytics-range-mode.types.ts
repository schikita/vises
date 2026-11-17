import type { ANALYTICS_RANGE_MODE } from '../constants/analytics-range-mode.constants'

export type AnalyticsRangeMode =
  (typeof ANALYTICS_RANGE_MODE)[keyof typeof ANALYTICS_RANGE_MODE]
