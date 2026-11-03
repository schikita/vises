import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
} from 'date-fns'
import { DATE_RANGE_PICKER_PRESET } from './date-range-picker.constants'
import type {
  DateRangePickerIsoRange,
  DateRangePickerPresetId,
} from './date-range-picker.types'
import { formatIsoDate } from './format-iso-date.util'

export const buildPresetRange = (
  presetId: DateRangePickerPresetId,
  today: Date = new Date(),
): DateRangePickerIsoRange => {
  if (presetId === DATE_RANGE_PICKER_PRESET.Last7Days) {
    return {
      from: formatIsoDate(subDays(today, 6)),
      to: formatIsoDate(today),
    }
  }

  if (presetId === DATE_RANGE_PICKER_PRESET.ThisMonth) {
    return {
      from: formatIsoDate(startOfMonth(today)),
      to: formatIsoDate(endOfMonth(today)),
    }
  }

  return {
    from: formatIsoDate(startOfYear(today)),
    to: formatIsoDate(endOfYear(today)),
  }
}
