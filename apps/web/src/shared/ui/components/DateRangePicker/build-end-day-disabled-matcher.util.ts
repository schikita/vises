import type { Matcher } from 'react-day-picker'

/**
 * End calendar: days strictly before start are not selectable (DEC-DRP-002).
 * Same-day start=end remains allowed.
 */
export const buildEndDayDisabledMatcher = (
  fromDate: Date | undefined,
): Matcher | undefined => {
  if (!fromDate) {
    return undefined
  }
  return { before: fromDate }
}
