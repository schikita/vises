/**
 * `BlsInvitingAuthority` radio values (site mirror).
 * `0` company → auth + contact; `1` hotel → auth only; `2` person → contact only.
 * Empty default — do not invent company (`0`) for storage (DEC-PF-006, AC-04).
 */
export const BLS_INVITING_AUTHORITY = {
  COMPANY: '0',
  HOTEL: '1',
  PERSON: '2',
} as const

export const BLS_INVITING_AUTHORITY_VALUES = [
  BLS_INVITING_AUTHORITY.COMPANY,
  BLS_INVITING_AUTHORITY.HOTEL,
  BLS_INVITING_AUTHORITY.PERSON,
] as const

/** English portal labels — worker-mappable; no GUID tables (AC-13). */
export const BLS_INVITING_AUTHORITY_LABELS = {
  [BLS_INVITING_AUTHORITY.COMPANY]: 'Inviting company/organization',
  [BLS_INVITING_AUTHORITY.HOTEL]:
    'Hotel(s) or temporary accommodation(s) in the member state(s)',
  [BLS_INVITING_AUTHORITY.PERSON]: 'Inviting person(s) in the member state(s)',
} as const
