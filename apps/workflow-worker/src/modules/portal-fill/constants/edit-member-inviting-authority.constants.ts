/**
 * `BlsInvitingAuthority` radio values (flow.md §9).
 * `0` company → auth + contact; `1` hotel → auth only; `2` person → contact only.
 */
export const EDIT_MEMBER_INVITING_AUTHORITY_VALUE = {
  COMPANY: '0',
  HOTEL: '1',
  PERSON: '2',
} as const;

export type EditMemberInvitingAuthorityValue =
  (typeof EDIT_MEMBER_INVITING_AUTHORITY_VALUE)[keyof typeof EDIT_MEMBER_INVITING_AUTHORITY_VALUE];
