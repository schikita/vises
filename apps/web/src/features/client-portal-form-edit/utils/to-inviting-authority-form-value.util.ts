import { PORTAL_FORM_INVITING_AUTHORITY_VALUE } from '../constants'
import type { PortalFormInvitingAuthorityValue } from '../types'

/** Coerce CRM / input string to portal inviting-authority form literal. */
export const toInvitingAuthorityFormValue = (
  value: string,
): PortalFormInvitingAuthorityValue | '' => {
  const trimmed = value.trim()
  if (trimmed === PORTAL_FORM_INVITING_AUTHORITY_VALUE.COMPANY) {
    return PORTAL_FORM_INVITING_AUTHORITY_VALUE.COMPANY
  }
  if (trimmed === PORTAL_FORM_INVITING_AUTHORITY_VALUE.HOTEL) {
    return PORTAL_FORM_INVITING_AUTHORITY_VALUE.HOTEL
  }
  if (trimmed === PORTAL_FORM_INVITING_AUTHORITY_VALUE.PERSON) {
    return PORTAL_FORM_INVITING_AUTHORITY_VALUE.PERSON
  }
  return ''
}
