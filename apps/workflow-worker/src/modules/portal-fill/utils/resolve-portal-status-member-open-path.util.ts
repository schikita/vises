import { PORTAL_STATUS_MEMBER_BRANCH } from '../constants/portal-status-member-branch.constants';
import type {
  ResolvePortalStatusMemberOpenPathInput,
  ResolvePortalStatusMemberOpenPathResult,
} from '../types/resolve-portal-status-member-open-path.types';

/**
 * Decide Edit vs Add New Member for this STATUS_APPLICANT task (OQ-005).
 * Add only when: pre-start extras, Phase B click allowed, pending portal add,
 * current applicant is not the application primary, and not already on portal
 * by name.
 */
export const resolvePortalStatusMemberOpenPath = (
  input: ResolvePortalStatusMemberOpenPathInput,
): ResolvePortalStatusMemberOpenPathResult => {
  const currentId = input.currentApplicantId.trim();
  const primaryId = input.applicationPrimaryApplicantId.trim();
  const branchWhenExtras = input.shouldAddFamilyMembers
    ? PORTAL_STATUS_MEMBER_BRANCH.EDIT_EXISTING
    : undefined;

  if (input.nameMatchedRow != null) {
    return {
      mode: 'EDIT_EXISTING',
      memberBranch: branchWhenExtras,
      reason: 'name_matched_edit_existing',
    };
  }

  const isAdditional =
    input.shouldAddFamilyMembers === true &&
    currentId.length > 0 &&
    primaryId.length > 0 &&
    currentId !== primaryId;

  if (
    isAdditional &&
    input.addClickAllowed === true &&
    input.pendingPortalAdd === true
  ) {
    return {
      mode: 'ADD_NEW_MEMBER',
      memberBranch: PORTAL_STATUS_MEMBER_BRANCH.ADD_NEW_MEMBER,
      reason: 'pre_start_extra_pending_portal_add',
    };
  }

  if (input.statusMatchedRow != null) {
    return {
      mode: 'EDIT_EXISTING',
      memberBranch: branchWhenExtras,
      reason: 'status_matched_edit_existing',
    };
  }

  if (isAdditional && input.addClickAllowed !== true) {
    return {
      mode: 'NONE',
      memberBranch: undefined,
      reason: 'add_click_not_allowed_no_portal_row',
    };
  }

  if (isAdditional && input.pendingPortalAdd !== true) {
    return {
      mode: 'NONE',
      memberBranch: undefined,
      reason: 'extra_not_pending_and_name_unmatched',
    };
  }

  return {
    mode: 'NONE',
    memberBranch: undefined,
    reason: 'applicant_row_missing',
  };
};
