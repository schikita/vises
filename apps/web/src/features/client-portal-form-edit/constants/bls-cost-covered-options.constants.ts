import type { PortalFormSelectOption } from '../types'

/** Trimmed `Name` values from `costCoveredData` in manage_applicant(form).html. Site order. */
export const BLS_COST_COVERED_OPTIONS: readonly PortalFormSelectOption[] = [
  { value: 'By a Sponsor(Host, Company, Organisation)', label: 'By a Sponsor(Host, Company, Organisation)' },
  { value: 'By the Applicant himself / herself', label: 'By the Applicant himself / herself' },
]
