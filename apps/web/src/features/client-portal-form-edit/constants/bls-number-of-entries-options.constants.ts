import type { PortalFormSelectOption } from '../types'

/** Trimmed `Name` values from `noOfEntriesData` in manage_applicant(form).html. Site order. */
export const BLS_NUMBER_OF_ENTRIES_OPTIONS: readonly PortalFormSelectOption[] = [
  { value: 'Multiple Entries', label: 'Multiple Entries' },
  { value: 'Single Entry', label: 'Single Entry' },
  { value: 'Two Entries', label: 'Two Entries' },
]
