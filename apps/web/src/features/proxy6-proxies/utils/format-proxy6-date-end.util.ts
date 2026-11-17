/** Format ISO dateEnd for inventory rows; safe fallback when invalid. */
export const formatProxy6DateEnd = (
  iso: string | null | undefined,
  unknownLabel: string,
): string => {
  if (!iso) return unknownLabel
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return unknownLabel
  return date.toLocaleString()
}
