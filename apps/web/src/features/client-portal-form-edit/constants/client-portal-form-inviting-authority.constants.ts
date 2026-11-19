/**
 * BlsInvitingAuthority radio values from manage_applicant(form).html (portal 0|1|2).
 * Do not invent GUIDs — store portal radio values as CRM strings.
 */
export const PORTAL_FORM_INVITING_AUTHORITY_VALUE = {
  COMPANY: '0',
  HOTEL: '1',
  PERSON: '2',
} as const

export const PORTAL_FORM_INVITING_AUTHORITY_OPTIONS = [
  {
    value: PORTAL_FORM_INVITING_AUTHORITY_VALUE.COMPANY,
    labelKey: 'company',
  },
  {
    value: PORTAL_FORM_INVITING_AUTHORITY_VALUE.HOTEL,
    labelKey: 'hotel',
  },
  {
    value: PORTAL_FORM_INVITING_AUTHORITY_VALUE.PERSON,
    labelKey: 'person',
  },
] as const
