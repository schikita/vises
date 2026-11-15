/**
 * Map form flag string back to boolean | null for portalFormConditionals.
 * Empty → null (unset); unknown non-empty strings pass through as string via caller.
 */
export const formStringToConditionalFlag = (
  value: string,
): boolean | null => {
  const trimmed = value.trim()
  if (trimmed === '') {
    return null
  }
  if (trimmed === 'true') {
    return true
  }
  if (trimmed === 'false') {
    return false
  }
  return null
}
