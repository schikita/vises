import type { PortalFormSelectOption } from '../types'

/** Trimmed `Name` values from `journeyPurposeData` in manage_applicant(form).html. Site order. */
export const BLS_JOURNEY_PURPOSE_OPTIONS: readonly PortalFormSelectOption[] = [
  { value: 'Airport transit', label: 'Airport transit' },
  { value: 'Business', label: 'Business' },
  { value: 'Cultural reasons', label: 'Cultural reasons' },
  { value: 'Medical reasons', label: 'Medical reasons' },
  { value: 'Official visit', label: 'Official visit' },
  { value: 'Others', label: 'Others' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Study', label: 'Study' },
  { value: 'Tourism', label: 'Tourism' },
  { value: 'Transit', label: 'Transit' },
  { value: 'Visiting family', label: 'Visiting family' },
]
