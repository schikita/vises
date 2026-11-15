import { PORTAL_FORM_FINGERPRINT_DATE_REQUIRED_VALUES } from '../constants'

const DATE_VISIBLE_SET = new Set<string>(
  PORTAL_FORM_FINGERPRINT_DATE_REQUIRED_VALUES,
)

/** Show previousFingerPrintDate when status requires it (REQ-FE-008). */
export const isFingerprintDateVisible = (status: string): boolean =>
  DATE_VISIBLE_SET.has(status.trim())
