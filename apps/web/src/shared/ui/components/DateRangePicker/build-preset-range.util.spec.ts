import { describe, expect, it } from 'vitest'
import { DATE_RANGE_PICKER_PRESET } from './date-range-picker.constants'
import { buildPresetRange } from './build-preset-range.util'

describe('buildPresetRange', (): void => {
  const today = new Date(2026, 10, 15)

  it('builds last 7 days inclusive of today', (): void => {
    expect(buildPresetRange(DATE_RANGE_PICKER_PRESET.Last7Days, today)).toEqual(
      {
        from: '2026-11-09',
        to: '2026-11-15',
      },
    )
  })

  it('builds this month from start to end', (): void => {
    expect(buildPresetRange(DATE_RANGE_PICKER_PRESET.ThisMonth, today)).toEqual(
      {
        from: '2026-11-01',
        to: '2026-11-30',
      },
    )
  })

  it('builds this year from start to end', (): void => {
    expect(buildPresetRange(DATE_RANGE_PICKER_PRESET.ThisYear, today)).toEqual({
      from: '2026-01-01',
      to: '2026-12-31',
    })
  })
})
