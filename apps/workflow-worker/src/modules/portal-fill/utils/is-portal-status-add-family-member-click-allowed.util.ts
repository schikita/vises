import { PORTAL_STATUS_ADD_FAMILY_MEMBER_PHASE_B_ENABLED } from '../constants/portal-status-add-family-member.constants';

/**
 * Hard gate for Add New Member / ManageApplicant('').
 * Requires both `shouldAddFamilyMembers` (OQ-005) and Phase B enabled.
 */
export const isPortalStatusAddFamilyMemberClickAllowed = (input: {
  shouldAddFamilyMembers: boolean;
  phaseBEnabled?: boolean;
}): boolean => {
  const phaseBEnabled =
    input.phaseBEnabled ?? PORTAL_STATUS_ADD_FAMILY_MEMBER_PHASE_B_ENABLED;
  return input.shouldAddFamilyMembers === true && phaseBEnabled === true;
};
