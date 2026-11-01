import { describe, expect, it } from 'vitest'
import { formatAnalyticsPercentageDisplay } from './format-analytics-percentage-display.util'

describe('formatAnalyticsPercentageDisplay', (): void => {
  it('keeps API decimal strings as-is (no re-round)', (): void => {
    expect(formatAnalyticsPercentageDisplay('33.33')).toBe('33.33%')
    expect(formatAnalyticsPercentageDisplay('0.00')).toBe('0.00%')
    expect(formatAnalyticsPercentageDisplay('100.00')).toBe('100.00%')
    expect(formatAnalyticsPercentageDisplay('12.5')).toBe('12.5%')
  })
})
