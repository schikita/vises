import { APPLICATION_DETAIL_START_API_DETAIL_SEPARATOR } from '../constants'

/**
 * Split Nest start/supersede `{ detail }` into Dialog lines (DEC-006).
 * Single-segment details (no separator) yield a one-item list.
 */
export const splitApplicationDetailStartApiDetail = (
  detail: string,
): string[] => {
  const trimmed = detail.trim()
  if (!trimmed) return []
  return trimmed
    .split(APPLICATION_DETAIL_START_API_DETAIL_SEPARATOR)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}
