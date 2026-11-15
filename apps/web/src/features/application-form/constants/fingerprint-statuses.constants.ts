/**
 * `PreviousFingerPrintStatus` radio values (site mirror).
 * Empty default — do not invent status for storage (REQ-017 / AC-14).
 * Date required only when status = `0`.
 */
export const PREVIOUS_FINGERPRINT_STATUS = {
  TAKEN_LAST_59_MONTHS: '0',
  LEGAL_UNDER_12: '1',
  NO_EXEMPTION: '2',
} as const

export const PREVIOUS_FINGERPRINT_STATUS_VALUES = [
  PREVIOUS_FINGERPRINT_STATUS.TAKEN_LAST_59_MONTHS,
  PREVIOUS_FINGERPRINT_STATUS.LEGAL_UNDER_12,
  PREVIOUS_FINGERPRINT_STATUS.NO_EXEMPTION,
] as const

/** Status that requires Previous Finger Print Date on the portal. */
export const PREVIOUS_FINGERPRINT_STATUS_REQUIRES_DATE =
  PREVIOUS_FINGERPRINT_STATUS.TAKEN_LAST_59_MONTHS

/** English portal labels — worker-mappable; no GUID tables (AC-13). */
export const PREVIOUS_FINGERPRINT_STATUS_LABELS = {
  [PREVIOUS_FINGERPRINT_STATUS.TAKEN_LAST_59_MONTHS]:
    'Prints taken in last 59 months for Schengen visa applications',
  [PREVIOUS_FINGERPRINT_STATUS.LEGAL_UNDER_12]:
    'For legal reasons(under 12 years old)',
  [PREVIOUS_FINGERPRINT_STATUS.NO_EXEMPTION]: 'No reason for exemption',
} as const
