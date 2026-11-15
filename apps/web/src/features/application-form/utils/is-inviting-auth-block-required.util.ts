import { BLS_INVITING_AUTHORITY } from '../constants/inviting-authority.constants'

/** Auth block (`inviting_*`) required for company (`0`) or hotel (`1`). */
export const isInvitingAuthBlockRequired = (
  blsInvitingAuthority: string | null | undefined,
): boolean => {
  const value = (blsInvitingAuthority ?? '').trim()
  return (
    value === BLS_INVITING_AUTHORITY.COMPANY ||
    value === BLS_INVITING_AUTHORITY.HOTEL
  )
}
