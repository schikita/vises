import { BLS_INVITING_AUTHORITY } from '../constants/inviting-authority.constants'

/** Contact block (`invitingContact*`) required for company (`0`) or person (`2`). */
export const isInvitingContactBlockRequired = (
  blsInvitingAuthority: string | null | undefined,
): boolean => {
  const value = (blsInvitingAuthority ?? '').trim()
  return (
    value === BLS_INVITING_AUTHORITY.COMPANY ||
    value === BLS_INVITING_AUTHORITY.PERSON
  )
}
