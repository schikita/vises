import { PORTAL_FORM_INVITING_AUTHORITY_VALUE } from '../constants'

export type PortalFormInvitingAuthorityValue =
  (typeof PORTAL_FORM_INVITING_AUTHORITY_VALUE)[keyof typeof PORTAL_FORM_INVITING_AUTHORITY_VALUE]
