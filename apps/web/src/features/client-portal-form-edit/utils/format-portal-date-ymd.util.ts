import { format } from 'date-fns'

/** Display and stored portal date: yyyy-MM-dd. */
export const formatPortalDateYmd = (date: Date): string =>
  format(date, 'yyyy-MM-dd')
