import { describe, expect, it } from 'vitest'
import { formatPortalDateYmd } from './format-portal-date-ymd.util'

describe('formatPortalDateYmd', (): void => {
  it('formats a selected date as yyyy-MM-dd', (): void => {
    expect(formatPortalDateYmd(new Date(2026, 2, 5))).toBe('2026-03-05')
  })
})
