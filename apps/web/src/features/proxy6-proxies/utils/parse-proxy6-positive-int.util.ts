/** Parse a positive integer string; null if not finite or below min. */
export const parseProxy6PositiveInt = (
  raw: string,
  min: number,
): number | null => {
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < min) return null
  return n
}
