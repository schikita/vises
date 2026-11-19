import type { PortalFormSelectOption } from '../types'

/** Trimmed `Name` values from `passportTypeData` in manage_applicant(form).html. Site order. */
export const BLS_PASSPORT_TYPE_OPTIONS: readonly PortalFormSelectOption[] = [
  { value: 'Ordinary Passport', label: 'Ordinary Passport' },
  { value: 'Collective Passport', label: 'Collective Passport' },
  { value: 'Diplomatic Passport', label: 'Diplomatic Passport' },
  { value: 'D. Viaje Apatridas C. New York', label: 'D. Viaje Apatridas C. New York' },
  { value: 'Government official on duty', label: 'Government official on duty' },
  { value: 'National laissez-passer', label: 'National laissez-passer' },
  { value: 'Official Passport', label: 'Official Passport' },
  { value: 'Passport of foreigners', label: 'Passport of foreigners' },
  { value: 'Protection passport', label: 'Protection passport' },
  { value: 'Refugee Travel Document (Geneva Convention)', label: 'Refugee Travel Document (Geneva Convention)' },
  { value: 'Seaman book', label: 'Seaman book' },
  { value: 'UN laissez-passer', label: 'UN laissez-passer' },
]
