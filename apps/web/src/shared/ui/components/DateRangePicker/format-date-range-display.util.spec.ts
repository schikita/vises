import { describe, expect, it } from 'vitest'
import { formatDateRangeDisplay } from './format-date-range-display.util'

describe('formatDateRangeDisplay', (): void => {
  it('formats a complete range as DD.MM.YYYY - DD.MM.YYYY', (): void => {
    expect(formatDateRangeDisplay('2026-11-01', '2026-11-15', 'placeholder')).toBe(
      '01.11.2026 - 15.11.2026',
    )
  })

  it('shows partial from with ellipsis', (): void => {
    expect(formatDateRangeDisplay('2026-11-01', '', 'placeholder')).toBe(
      '01.11.2026 - …',
    )
  })

  it('returns placeholder when empty', (): void => {
    expect(formatDateRangeDisplay('', '', 'Select date range')).toBe(
      'Select date range',
    )
  })
})
