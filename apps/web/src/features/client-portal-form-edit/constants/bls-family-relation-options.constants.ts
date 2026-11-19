import type { PortalFormSelectOption } from '../types'

/** Trimmed `Name` values from `familyRelationData` in manage_applicant(form).html. Site order. */
export const BLS_FAMILY_RELATION_OPTIONS: readonly PortalFormSelectOption[] = [
  { value: 'Child', label: 'Child' },
  { value: 'Dependent Ascendant', label: 'Dependent Ascendant' },
  { value: 'Grandchild', label: 'Grandchild' },
  { value: 'Spouse', label: 'Spouse' },
]
