import { describe, expect, it } from 'vitest'
import { ANALYTICS_QUERY_KEYS } from './analytics-query-keys.constants'

describe('ANALYTICS_QUERY_KEYS.rolesApplications', (): void => {
  it('includes q as null when search is absent (FE23)', (): void => {
    expect(
      ANALYTICS_QUERY_KEYS.rolesApplications({
        page: 1,
        pageSize: 5,
      }),
    ).toEqual(['analytics', 'roles-applications', null, null, 1, 5, null])
  })

  it('includes q so search results are not served from a stale cache (FE23)', (): void => {
    const withoutQ = ANALYTICS_QUERY_KEYS.rolesApplications({
      page: 1,
      pageSize: 5,
    })
    const withQ = ANALYTICS_QUERY_KEYS.rolesApplications({
      page: 1,
      pageSize: 5,
      q: 'alice',
    })

    expect(withQ).toEqual([
      'analytics',
      'roles-applications',
      null,
      null,
      1,
      5,
      'alice',
    ])
    expect(withQ).not.toEqual(withoutQ)
  })
})
