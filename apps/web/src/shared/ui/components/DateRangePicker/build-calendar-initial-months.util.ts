import { clampDisplayMonth } from './clamp-display-month.util'
import type {
  CalendarInitialMonths,
  DayPickerBounds,
} from './date-range-picker.types'

/**
 * Months to show when opening the popover or applying a preset.
 */
export const buildCalendarInitialMonths = (
  fromDate: Date | undefined,
  toDate: Date | undefined,
  bounds: DayPickerBounds,
  today: Date = new Date(),
): CalendarInitialMonths => {
  return {
    start: clampDisplayMonth(
      fromDate ?? today,
      bounds.startMonth,
      bounds.endMonth,
    ),
    end: clampDisplayMonth(
      toDate ?? fromDate ?? today,
      bounds.startMonth,
      bounds.endMonth,
    ),
  }
}
