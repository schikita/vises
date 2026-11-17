import { isAfter, startOfDay } from 'date-fns'
import { parseIsoDate } from './parse-iso-date.util'

/**
 * When start moves after the current end, clear end (plan OQ-DRP-002).
 */
export const shouldClearToAfterFromChange = (
  nextFromIso: string,
  currentToIso: string,
): boolean => {
  const nextFrom = parseIsoDate(nextFromIso)
  const currentTo = parseIsoDate(currentToIso)
  if (!nextFrom || !currentTo) {
    return false
  }
  return isAfter(startOfDay(nextFrom), startOfDay(currentTo))
}
