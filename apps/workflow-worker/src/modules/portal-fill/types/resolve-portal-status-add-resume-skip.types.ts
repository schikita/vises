/**
 * Live-first decision for skipping Add New Member re-click on resume
 * (dual-SoT: live scrape for branch; checkpoint never invents an open form).
 */
export type ResolvePortalStatusAddResumeSkipInput = {
  /**
   * True when prior checkpoint is ADD_NEW_MEMBER past OPEN_ADD_MEMBER.
   * Informational only — must not alone authorize skip.
   */
  checkpointPastOpenAddMember: boolean;
  /** Live `#visaTypeModal` visible on page. */
  liveVisaModalVisible: boolean;
  /** Live Edit Member iframe resolved with form cues. */
  liveEditFrameReady: boolean;
  /** Live Edit Member form visible (page or iframe). */
  liveEditFormVisible: boolean;
};

export type ResolvePortalStatusAddResumeSkipResult = {
  /** Skip ManageApplicant('') / Add New Member click. */
  skipAddClick: boolean;
  /**
   * Enter shared post-open fill path without re-clicking Add.
   * True only when live evidence shows the member form path open.
   */
  treatAsFormOpened: boolean;
  /** Safe note token — no PII. */
  reason: string;
};
