import { format } from 'date-fns'
import type { DateRangePickerMonthItem } from './date-range-picker.types'

export const buildMonthGridItems = (
  year: number,
): DateRangePickerMonthItem[] => {
  return Array.from(
    { length: 12 },
    (_: unknown, monthIndex: number): DateRangePickerMonthItem => {
      const date = new Date(year, monthIndex, 1)
      return {
        monthIndex,
        label: format(date, 'MMM'),
        date,
      }
    },
  )
}
