import { describe, expect, it } from 'vitest'
import { DATE_RANGE_PICKER_VIEW_MODE } from './date-range-picker.constants'
import { formatCaptionLabel } from './format-caption-label.util'

describe('formatCaptionLabel', (): void => {
  const month = new Date(2026, 10, 1)

  it('formats day view as Month Year', (): void => {
    expect(
      formatCaptionLabel(DATE_RANGE_PICKER_VIEW_MODE.Days, month, 2020, 12),
    ).toBe('November 2026')
  })

  it('formats month view as year', (): void => {
    expect(
      formatCaptionLabel(DATE_RANGE_PICKER_VIEW_MODE.Months, month, 2020, 12),
    ).toBe('2026')
  })

  it('formats year view as page range', (): void => {
    expect(
      formatCaptionLabel(DATE_RANGE_PICKER_VIEW_MODE.Years, month, 2020, 10),
    ).toBe('2020 – 2029')
  })
})
