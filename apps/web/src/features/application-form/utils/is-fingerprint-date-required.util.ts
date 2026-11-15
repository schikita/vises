import { PREVIOUS_FINGERPRINT_STATUS_REQUIRES_DATE } from '../constants/fingerprint-statuses.constants'

/** Fingerprint date required only when status is `0` (site semantics / AC-14). */
export const isFingerprintDateRequired = (
  previousFingerPrintStatus: string | null | undefined,
): boolean => {
  return (
    (previousFingerPrintStatus ?? '').trim() ===
    PREVIOUS_FINGERPRINT_STATUS_REQUIRES_DATE
  )
}
