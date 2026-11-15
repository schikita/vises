import type { BLS_INVITING_AUTHORITY } from '../constants/inviting-authority.constants'

export type BlsInvitingAuthorityValue =
  (typeof BLS_INVITING_AUTHORITY)[keyof typeof BLS_INVITING_AUTHORITY]
