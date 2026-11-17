import { addYears, endOfYear, startOfYear, subYears } from 'date-fns'
import { DATE_RANGE_PICKER_YEAR_WINDOW } from './date-range-picker.constants'
import type { DayPickerBounds } from './date-range-picker.types'

export const buildDayPickerBounds = (
  today: Date = new Date(),
): DayPickerBounds => {
  return {
    startMonth: startOfYear(subYears(today, DATE_RANGE_PICKER_YEAR_WINDOW)),
    endMonth: endOfYear(addYears(today, DATE_RANGE_PICKER_YEAR_WINDOW)),
  }
}
