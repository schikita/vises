import type { PortalFormSelectOption } from '../types'

/** Trimmed `Name` values from `meansOfSupportData` in manage_applicant(form).html. Site order. */
export const BLS_MEANS_OF_SUPPORT_OPTIONS: readonly PortalFormSelectOption[] = [
  { value: 'Accommodation provided', label: 'Accommodation provided' },
  { value: 'All expenses covered', label: 'All expenses covered' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Credit card', label: 'Credit card' },
  { value: 'Others', label: 'Others' },
  { value: 'Pre-paid accommodation', label: 'Pre-paid accommodation' },
  { value: 'Pre-paid transport', label: 'Pre-paid transport' },
  { value: 'Traveller cheques', label: 'Traveller cheques' },
]
