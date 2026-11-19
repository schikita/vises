import { describe, expect, it } from 'vitest'
import { ANALYTICS_QUERY_KEYS } from './analytics-query-keys.constants'

describe('ANALYTICS_QUERY_KEYS.rolesApplications', (): void => {
  it('keys current totals with null from/to', (): void => {
    expect(ANALYTICS_QUERY_KEYS.rolesApplications({})).toEqual([
      'analytics',
      'roles-applications',
      null,
      null,
    ])
  })

  it('includes from/to so range results are not served from a stale cache', (): void => {
    const current = ANALYTICS_QUERY_KEYS.rolesApplications({})
    const ranged = ANALYTICS_QUERY_KEYS.rolesApplications({
      from: '2026-01-01',
      to: '2026-01-31',
    })

    expect(ranged).toEqual([
      'analytics',
      'roles-applications',
      '2026-01-01',
      '2026-01-31',
    ])
    expect(ranged).not.toEqual(current)
  })
})
