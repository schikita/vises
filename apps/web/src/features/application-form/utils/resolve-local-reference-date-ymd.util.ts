import { formatDateOnlyParts } from './format-date-only-parts.util'

/**
 * Browser-local calendar reference day `D` as `YYYY-MM-DD` (DEC-004).
 */
export const resolveLocalReferenceDateYmd = (): string => {
  const now = new Date()
  return formatDateOnlyParts({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  })
}
