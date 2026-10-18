import type { DateOnlyParts } from '../types/date-only.types'

/**
 * Add `years` with day clamp to last day of target month (DEC-007 / e4).
 */
export const addCalendarYears = (parts: DateOnlyParts, years: number): DateOnlyParts => {
  const year = parts.year + years
  const maxDay = new Date(Date.UTC(year, parts.month, 0)).getUTCDate()
  const day = parts.day > maxDay ? maxDay : parts.day
  return { year, month: parts.month, day }
}
