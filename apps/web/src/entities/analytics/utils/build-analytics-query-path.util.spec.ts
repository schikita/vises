import { describe, expect, it } from 'vitest'
import { buildAnalyticsQueryPath } from './build-analytics-query-path.util'

describe('buildAnalyticsQueryPath', (): void => {
  it('omits query when current totals (no from/to/page)', (): void => {
    expect(buildAnalyticsQueryPath({})).toBe('/stats/roles-applications')
  })

  it('forwards from and to for receivedAt range filtering', (): void => {
    expect(
      buildAnalyticsQueryPath({ from: '2026-01-01', to: '2026-01-31' }),
    ).toBe('/stats/roles-applications?from=2026-01-01&to=2026-01-31')
  })

  it('supports open-ended from-only or to-only bounds', (): void => {
    expect(buildAnalyticsQueryPath({ from: '2026-01-15' })).toBe(
      '/stats/roles-applications?from=2026-01-15',
    )
    expect(buildAnalyticsQueryPath({ to: '2026-01-20' })).toBe(
      '/stats/roles-applications?to=2026-01-20',
    )
  })

  it('forwards page and pageSize for perAgent pagination', (): void => {
    expect(buildAnalyticsQueryPath({ page: 2, pageSize: 20 })).toBe(
      '/stats/roles-applications?page=2&pageSize=20',
    )
  })

  it('forwards q for perAgent agent search (DEC-P15)', (): void => {
    expect(buildAnalyticsQueryPath({ q: 'alice', pageSize: 5 })).toBe(
      '/stats/roles-applications?pageSize=5&q=alice',
    )
  })
})
