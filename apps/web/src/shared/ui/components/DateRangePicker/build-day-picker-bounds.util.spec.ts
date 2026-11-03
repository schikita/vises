import { describe, expect, it } from 'vitest'
import { buildDayPickerBounds } from './build-day-picker-bounds.util'

describe('buildDayPickerBounds', (): void => {
  it('spans CurrentYear−30 through CurrentYear+30 inclusive (DEC-FE22-1)', (): void => {
    const today = new Date(2026, 10, 2)
    const bounds = buildDayPickerBounds(today)

    expect(bounds.startMonth.getFullYear()).toBe(1996)
    expect(bounds.startMonth.getMonth()).toBe(0)
    expect(bounds.startMonth.getDate()).toBe(1)

    expect(bounds.endMonth.getFullYear()).toBe(2056)
    expect(bounds.endMonth.getMonth()).toBe(11)
    expect(bounds.endMonth.getDate()).toBe(31)
  })

  it('allows selecting future years beyond the current year', (): void => {
    const today = new Date(2026, 0, 15)
    const bounds = buildDayPickerBounds(today)

    expect(bounds.endMonth.getTime()).toBeGreaterThan(
      new Date(2026, 11, 31).getTime(),
    )
  })
})
