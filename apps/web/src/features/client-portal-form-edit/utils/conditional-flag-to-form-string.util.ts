/**
 * Normalize ClientPortalFormConditionals flag (boolean | string | null)
 * into a form string for checkboxes / radios.
 */
export const conditionalFlagToFormString = (
  value: boolean | string | null | undefined,
): string => {
  if (value === true || value === 'true') {
    return 'true'
  }
  if (value === false || value === 'false') {
    return 'false'
  }
  if (typeof value === 'string') {
    return value
  }
  return ''
}
