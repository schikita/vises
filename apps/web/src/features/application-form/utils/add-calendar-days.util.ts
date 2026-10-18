import type { DateOnlyParts } from '../types/date-only.types'

/**
 * Add `days` (may be negative) via UTC `setUTCDate` civil arithmetic (DEC-007).
 */
export const addCalendarDays = (parts: DateOnlyParts, days: number): DateOnlyParts => {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
  date.setUTCDate(date.getUTCDate() + days)
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  }
}
