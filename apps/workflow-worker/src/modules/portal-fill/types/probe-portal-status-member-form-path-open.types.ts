/**
 * Live DOM probes for whether Add/Edit member form path is already open
 * (visa modal, edit iframe, or edit form).
 */
export type ProbePortalStatusMemberFormPathOpenResult = {
  liveVisaModalVisible: boolean;
  liveEditFrameReady: boolean;
  liveEditFormVisible: boolean;
  /** Any of the live cues — authorize skip of Add re-click. */
  liveMemberFormPathOpen: boolean;
};
