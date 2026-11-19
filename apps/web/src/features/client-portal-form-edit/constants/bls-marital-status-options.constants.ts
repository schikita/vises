import type { PortalFormSelectOption } from '../types'

/** Trimmed `Name` values from `maritalStatusData` in manage_applicant(form).html. Site order. */
export const BLS_MARITAL_STATUS_OPTIONS: readonly PortalFormSelectOption[] = [
  { value: 'Other', label: 'Other' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Married', label: 'Married' },
  { value: 'Separated', label: 'Separated' },
  { value: 'Single', label: 'Single' },
  { value: 'Widow(er)', label: 'Widow(er)' },
]
