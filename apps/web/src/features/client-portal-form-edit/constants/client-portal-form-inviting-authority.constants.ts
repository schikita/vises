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
    label: 'Inviting company/organization',
  },
  {
    value: PORTAL_FORM_INVITING_AUTHORITY_VALUE.HOTEL,
    label:
      'Hotel(s) or temporary accommodation(s) in the member state(s)',
  },
  {
    value: PORTAL_FORM_INVITING_AUTHORITY_VALUE.PERSON,
    label: 'Inviting person(s) in the member state(s)',
  },
] as const
