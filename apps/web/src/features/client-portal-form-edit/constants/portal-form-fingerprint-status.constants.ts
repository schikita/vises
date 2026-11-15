/**
 * PreviousFingerPrintStatus radio values from manage_applicant(form).html.
 * Date field shows when status is prints-taken (0 / PrintsTakenInLast59Months).
 */
export const PORTAL_FORM_FINGERPRINT_STATUS_VALUE = {
  PRINTS_TAKEN: '0',
  LEGAL_REASONS: '1',
  NO_EXEMPTION: '2',
} as const

export const PORTAL_FORM_FINGERPRINT_STATUS_OPTIONS = [
  {
    value: PORTAL_FORM_FINGERPRINT_STATUS_VALUE.PRINTS_TAKEN,
    label:
      'Prints taken in last 59 months for Schengen visa applications',
  },
  {
    value: PORTAL_FORM_FINGERPRINT_STATUS_VALUE.LEGAL_REASONS,
    label: 'For legal reasons(under 12 years old)',
  },
  {
    value: PORTAL_FORM_FINGERPRINT_STATUS_VALUE.NO_EXEMPTION,
    label: 'No reason for exemption',
  },
] as const

/** Values that require previousFingerPrintDate (portal + CRM name variants). */
export const PORTAL_FORM_FINGERPRINT_DATE_REQUIRED_VALUES = [
  PORTAL_FORM_FINGERPRINT_STATUS_VALUE.PRINTS_TAKEN,
  'PrintsTakenInLast59Months',
] as const
