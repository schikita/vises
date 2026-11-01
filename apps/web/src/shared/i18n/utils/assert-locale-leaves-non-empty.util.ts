/** Assert every string leaf in a locale catalog is non-empty (AC-20b presence). */
export const assertLocaleLeavesNonEmpty = (
  value: unknown,
  path = '',
): void => {
  if (typeof value === 'string') {
    if (value.length === 0) {
      throw new Error(`Empty locale string at "${path}"`)
    }
    return
  }

  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected nested locale object or string at "${path}"`)
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const nextPath = path.length > 0 ? `${path}.${key}` : key
    assertLocaleLeavesNonEmpty(child, nextPath)
  }
}
