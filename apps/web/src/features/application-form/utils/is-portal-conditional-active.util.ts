/**
 * Truthiness for portalFormConditionals control flags
 * (`boolean | string | null` per contracts).
 */
export const isPortalConditionalActive = (
  value: boolean | string | null | undefined,
): boolean => {
  if (value === true) return true
  if (typeof value !== 'string') return false
  const normalized = value.trim().toLowerCase()
  return (
    normalized === 'true' ||
    normalized === 'yes' ||
    normalized === '1'
  )
}
