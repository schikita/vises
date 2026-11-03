import { format } from 'date-fns'

export const formatIsoDate = (date: Date): string => format(date, 'yyyy-MM-dd')
