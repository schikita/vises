import { describe, expect, it } from 'vitest'
import { ANALYTICS_RANGE_MODE } from '@/features/analytics-filters'
import { resolveAnalyticsQueryParams } from './resolve-analytics-query-params.util'

describe('resolveAnalyticsQueryParams', (): void => {
  it('omits from/to in current-totals mode (AC-12a)', (): void => {
    expect(
      resolveAnalyticsQueryParams(
        ANALYTICS_RANGE_MODE.Current,
        '2026-01-01',
        '2026-01-31',
      ),
    ).toEqual({})
  })

  it('forwards from/to in range mode for receivedAt filtering', (): void => {
    expect(
      resolveAnalyticsQueryParams(
        ANALYTICS_RANGE_MODE.Range,
        '2026-01-01',
        '2026-01-31',
      ),
    ).toEqual({ from: '2026-01-01', to: '2026-01-31' })
  })
})
