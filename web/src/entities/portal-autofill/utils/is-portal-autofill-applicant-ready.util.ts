import type { Applicant } from '@/entities/application'
import { PORTAL_AUTOFILL_REQUIRED_FIELDS } from '../constants'
import { portalAutofillPhoneDigits } from './portal-autofill-phone-digits.util'

/**
 * Client-side completeness gate for staff portal autofill trigger (REQ-002 / DEC-005).
 * Does not use requiredDocsOk or CRM status.
 */
export const isPortalAutofillApplicantReady = (
  applicant: Applicant | undefined | null,
  clientEmail: string | undefined | null,
): boolean => {
  if (!applicant) return false
  for (const key of PORTAL_AUTOFILL_REQUIRED_FIELDS) {
    const raw = applicant[key]
    if (typeof raw !== 'string' || !raw.trim()) return false
  }
  if (portalAutofillPhoneDigits(applicant.phone).length !== 9) return false
  const email = (applicant.email ?? '').trim() || (clientEmail ?? '').trim()
  return Boolean(email)
}
