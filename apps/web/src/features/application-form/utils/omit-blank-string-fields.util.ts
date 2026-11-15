/**
 * Drop blank string fields from a partial DTO so inactive/empty controls
 * are omitted rather than invented as stored empties (DEC-PF-006/007).
 */
export const omitBlankStringFields = <T extends Record<string, unknown>>(
  input: T,
): Partial<T> => {
  const out: Partial<T> = {}
  for (const key of Object.keys(input) as Array<keyof T>) {
    const value = input[key]
    if (typeof value === 'string' && value.trim() === '') continue
    if (value === undefined) continue
    out[key] = value
  }
  return out
}
