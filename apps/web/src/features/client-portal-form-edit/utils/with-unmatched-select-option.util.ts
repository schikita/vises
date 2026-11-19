import type { PortalFormSelectOption } from '../types'

/** Keep a stored free-text value visible when it is not in the site list. */
export const withUnmatchedSelectOption = (
  options: readonly PortalFormSelectOption[],
  currentValue: string,
): readonly PortalFormSelectOption[] => {
  if (currentValue.trim() === '') {
    return options
  }
  const known = options.some(
    (option): boolean => option.value === currentValue,
  )
  if (known) {
    return options
  }
  return [...options, { value: currentValue, label: currentValue }]
}
