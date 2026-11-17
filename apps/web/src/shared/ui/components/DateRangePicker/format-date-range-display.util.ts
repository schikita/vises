import { format } from 'date-fns'
import { parseIsoDate } from './parse-iso-date.util'

export const formatDateRangeDisplay = (
  from: string,
  to: string,
  placeholder: string,
): string => {
  const fromDate = parseIsoDate(from)
  const toDate = parseIsoDate(to)

  if (fromDate && toDate) {
    return `${format(fromDate, 'dd.MM.yyyy')} - ${format(toDate, 'dd.MM.yyyy')}`
  }

  if (fromDate) {
    return `${format(fromDate, 'dd.MM.yyyy')} - …`
  }

  return placeholder
}
