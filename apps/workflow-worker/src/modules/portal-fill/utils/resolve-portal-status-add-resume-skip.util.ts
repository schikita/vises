import type {
  ResolvePortalStatusAddResumeSkipInput,
  ResolvePortalStatusAddResumeSkipResult,
} from '../types/resolve-portal-status-add-resume-skip.types';

/**
 * Skip Add New Member re-click only when live UI shows the member form path
 * already open (visa modal, edit frame, or edit form). Checkpoint past
 * OPEN_ADD_MEMBER alone must not skip — after re-login the page is Manage
 * Applicants again (aligns with resolvePortalStatusResumeEntry live-first).
 */
export const resolvePortalStatusAddResumeSkip = (
  input: ResolvePortalStatusAddResumeSkipInput,
): ResolvePortalStatusAddResumeSkipResult => {
  const liveMemberFormPathOpen =
    input.liveVisaModalVisible ||
    input.liveEditFrameReady ||
    input.liveEditFormVisible;

  if (liveMemberFormPathOpen) {
    return {
      skipAddClick: true,
      treatAsFormOpened: true,
      reason: 'live_member_form_path_open',
    };
  }

  if (input.checkpointPastOpenAddMember) {
    return {
      skipAddClick: false,
      treatAsFormOpened: false,
      reason: 'checkpoint_past_open_add_without_live_form',
    };
  }

  return {
    skipAddClick: false,
    treatAsFormOpened: false,
    reason: 'no_live_form_reclick_add',
  };
};
