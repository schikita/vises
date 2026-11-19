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
    labelKey: 'printsTaken',
  },
  {
    value: PORTAL_FORM_FINGERPRINT_STATUS_VALUE.LEGAL_REASONS,
    labelKey: 'legalReasons',
  },
  {
    value: PORTAL_FORM_FINGERPRINT_STATUS_VALUE.NO_EXEMPTION,
    labelKey: 'noExemption',
  },
] as const

/** Values that require previousFingerPrintDate (portal + CRM name variants). */
export const PORTAL_FORM_FINGERPRINT_DATE_REQUIRED_VALUES = [
  PORTAL_FORM_FINGERPRINT_STATUS_VALUE.PRINTS_TAKEN,
  'PrintsTakenInLast59Months',
] as const
