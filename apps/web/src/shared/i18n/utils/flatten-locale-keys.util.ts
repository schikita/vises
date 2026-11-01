/** Dot-path keys for a nested locale catalog object (AC-20b missing-key guard). */
export const flattenLocaleKeys = (
  value: unknown,
  prefix = '',
): readonly string[] => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return prefix.length > 0 ? [prefix] : []
  }

  const entries = Object.entries(value as Record<string, unknown>)
  if (entries.length === 0) {
    return prefix.length > 0 ? [prefix] : []
  }

  const keys: string[] = []
  for (const [key, child] of entries) {
    const path = prefix.length > 0 ? `${prefix}.${key}` : key
    keys.push(...flattenLocaleKeys(child, path))
  }
  return keys
}
