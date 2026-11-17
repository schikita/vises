/**
 * Presentable label for a Proxy6 country code (ISO 3166-1 alpha-2).
 * Value sent to the API stays the raw code; this is display-only.
 */
export const formatProxy6CountryLabel = (
  code: string,
  locale: string,
): string => {
  const normalized = code.trim().toLowerCase()
  if (!normalized) return code

  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' })
    const name = displayNames.of(normalized.toUpperCase())
    const nameNormalized = name?.trim().toLowerCase() ?? ''
    const isUnknown =
      !nameNormalized ||
      nameNormalized === normalized ||
      nameNormalized.includes('unknown')
    if (!isUnknown && name) {
      return `${name} (${normalized})`
    }
  } catch {
    // Fall through to code-only label.
  }

  return normalized
}
