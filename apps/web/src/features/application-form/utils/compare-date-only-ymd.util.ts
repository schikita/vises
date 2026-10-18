/**
 * Lexicographic compare of zero-padded `YYYY-MM-DD` strings.
 * Returns negative if `a < b`, 0 if equal, positive if `a > b`.
 */
export const compareDateOnlyYmd = (a: string, b: string): number => {
  if (a < b) {
    return -1
  }
  if (a > b) {
    return 1
  }
  return 0
}
