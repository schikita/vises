import { isAfter, isBefore, startOfMonth } from 'date-fns'

export const clampDisplayMonth = (
  month: Date,
  startMonth: Date,
  endMonth: Date,
): Date => {
  const candidate = startOfMonth(month)
  const min = startOfMonth(startMonth)
  const max = startOfMonth(endMonth)
  if (isBefore(candidate, min)) {
    return min
  }
  if (isAfter(candidate, max)) {
    return max
  }
  return candidate
}
