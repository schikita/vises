import type { PortalApplicantStatusRow } from './portal-status.types';
import type { PortalStatusMemberBranch } from './portal-status-checkpoint.types';

export type PortalStatusMemberOpenMode =
  | 'EDIT_EXISTING'
  | 'ADD_NEW_MEMBER'
  | 'NONE';

export type ResolvePortalStatusMemberOpenPathInput = {
  currentApplicantId: string;
  /** First CRM applicant id for the application (Edit primary). */
  applicationPrimaryApplicantId: string;
  shouldAddFamilyMembers: boolean;
  /** Phase B flag ∧ shouldAddFamilyMembers. */
  addClickAllowed: boolean;
  pendingPortalAdd: boolean;
  /** Name-token match only — avoids single-row false positives for extras. */
  nameMatchedRow: PortalApplicantStatusRow | null;
  /** Full match (name → ordinal → single-row). */
  statusMatchedRow: PortalApplicantStatusRow | null;
};

export type ResolvePortalStatusMemberOpenPathResult = {
  mode: PortalStatusMemberOpenMode;
  /**
   * Checkpoint memberBranch when pre-start extras exist; omit when none
   * (02-database.md).
   */
  memberBranch: PortalStatusMemberBranch | undefined;
  /** Safe note token — counts/flags only, no PII. */
  reason: string;
};
