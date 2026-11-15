import type { PREVIOUS_FINGERPRINT_STATUS } from '../constants/fingerprint-statuses.constants'

export type PreviousFingerPrintStatusValue =
  (typeof PREVIOUS_FINGERPRINT_STATUS)[keyof typeof PREVIOUS_FINGERPRINT_STATUS]
