import { isAfter, isBefore, startOfMonth } from 'date-fns'

export const isMonthWithinBounds = (
  month: Date,
  startMonth: Date,
  endMonth: Date,
): boolean => {
  const candidate = startOfMonth(month)
  if (isBefore(candidate, startOfMonth(startMonth))) {
    return false
  }
  if (isAfter(candidate, startOfMonth(endMonth))) {
    return false
  }
  return true
}
