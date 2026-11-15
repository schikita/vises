import { PORTAL_STATUS_MEMBER_BRANCH } from '../constants/portal-status-member-branch.constants';
import type {
  ResolvePortalStatusAddFamilyMemberGateInput,
  ResolvePortalStatusAddFamilyMemberGateResult,
} from '../types/resolve-portal-status-add-family-member-gate.types';

/**
 * Detect pre-start additional family members (OQ-005 / DEC-004 / REQ-025).
 * `shouldAddFamilyMembers` + Phase B flag gate any Add New Member click.
 */
export const resolvePortalStatusAddFamilyMemberGate = (
  input: ResolvePortalStatusAddFamilyMemberGateInput,
): ResolvePortalStatusAddFamilyMemberGateResult => {
  const primaryId = input.primaryApplicantId.trim();
  const normalizedIds = input.crmApplicantIds
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
  const uniqueIds = Array.from(new Set(normalizedIds));
  const additionalIds =
    primaryId.length > 0
      ? uniqueIds.filter((id) => id !== primaryId)
      : uniqueIds.slice(1);
  const preStartAdditionalMemberCount = additionalIds.length;
  const shouldAddFamilyMembers = preStartAdditionalMemberCount > 0;

  let pendingPortalAdd = false;
  if (shouldAddFamilyMembers) {
    if (input.portalRowCount !== undefined) {
      pendingPortalAdd = input.portalRowCount < uniqueIds.length;
    } else {
      pendingPortalAdd = true;
    }
  }

  const gateNotes: string[] = [
    `add_family_gate shouldAdd=${shouldAddFamilyMembers} additional=${preStartAdditionalMemberCount} crmApplicants=${uniqueIds.length}`,
  ];

  if (shouldAddFamilyMembers) {
    if (input.portalRowCount !== undefined) {
      gateNotes.push(
        `pending_portal_add=${pendingPortalAdd} portalRows=${input.portalRowCount}`,
      );
    } else {
      gateNotes.push(`pending_portal_add=${pendingPortalAdd}`);
    }
    gateNotes.push(
      pendingPortalAdd
        ? 'OPEN_ADD_MEMBER eligible when Phase B click allowed'
        : 'OPEN_ADD_MEMBER not pending — portal rows cover CRM applicants',
    );
  } else {
    gateNotes.push(
      'add_family_gate hard_no_click — no pre-start additional members',
    );
  }

  return {
    shouldAddFamilyMembers,
    preStartAdditionalMemberCount,
    primaryMemberBranch: shouldAddFamilyMembers
      ? PORTAL_STATUS_MEMBER_BRANCH.EDIT_EXISTING
      : undefined,
    pendingPortalAdd,
    gateNotes,
  };
};
