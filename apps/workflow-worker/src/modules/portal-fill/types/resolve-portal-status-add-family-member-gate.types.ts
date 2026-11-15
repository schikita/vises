import type { PortalStatusMemberBranch } from './portal-status-checkpoint.types';

/**
 * CRM + optional portal scrape inputs for OQ-005 Add Family Member gate
 * (MA-TASK-009 Phase B fill when extras exist pre-start).
 */
export type ResolvePortalStatusAddFamilyMemberGateInput = {
  /** Applicant ids entered in CRM before workflow start. */
  crmApplicantIds: ReadonlyArray<string>;
  /** Primary STATUS task applicant id (Edit existing path). */
  primaryApplicantId: string;
  /**
   * Scraped Manage Applicants row count when known.
   * Used for pendingPortalAdd (extras not yet on portal).
   */
  portalRowCount?: number;
};

/**
 * Gate result. `shouldAddFamilyMembers` must be true (with Phase B enabled)
 * before any Add New Member click (OQ-005 / DEC-004).
 */
export type ResolvePortalStatusAddFamilyMemberGateResult = {
  /** True when CRM has additional member(s) beyond the primary (OQ-005). */
  shouldAddFamilyMembers: boolean;
  /** Count of distinct CRM applicants excluding the primary. */
  preStartAdditionalMemberCount: number;
  /**
   * Checkpoint `memberBranch` for the primary Edit path when pre-start
   * members exist; omit when none (02-database.md).
   */
  primaryMemberBranch: PortalStatusMemberBranch | undefined;
  /**
   * True when extras exist and portal row count is below CRM applicant
   * count (or portal count unknown). With Phase B + click allowed, drives
   * ADD_NEW_MEMBER open path for unmatched extras.
   */
  pendingPortalAdd: boolean;
  /** Safe log/note tokens — ids counts only, no PII. */
  gateNotes: string[];
};
