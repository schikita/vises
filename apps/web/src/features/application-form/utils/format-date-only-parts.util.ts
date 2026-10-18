import type { DateOnlyParts } from '../types/date-only.types'

/** Format civil calendar parts as zero-padded `YYYY-MM-DD`. */
export const formatDateOnlyParts = (parts: DateOnlyParts): string => {
  const y = String(parts.year).padStart(4, '0')
  const m = String(parts.month).padStart(2, '0')
  const d = String(parts.day).padStart(2, '0')
  return `${y}-${m}-${d}`
}
