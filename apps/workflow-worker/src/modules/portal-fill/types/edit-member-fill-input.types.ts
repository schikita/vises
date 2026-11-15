import type { EDIT_MEMBER_FIELD_PLAN_ACTION } from '../constants/edit-member-field-plan-action.constants';
import type {
  PORTAL_STATUS_FIELD_FAIL_REASON,
  PORTAL_STATUS_FIELD_SKIP_REASON,
} from '../constants/portal-status-field-reason.constants';
import type { EditMemberPortalFieldId } from './edit-member-portal-field.types';

export type EditMemberFieldPlanAction =
  (typeof EDIT_MEMBER_FIELD_PLAN_ACTION)[keyof typeof EDIT_MEMBER_FIELD_PLAN_ACTION];

export type EditMemberFieldPlanReasonCode =
  | (typeof PORTAL_STATUS_FIELD_SKIP_REASON)[keyof typeof PORTAL_STATUS_FIELD_SKIP_REASON]
  | (typeof PORTAL_STATUS_FIELD_FAIL_REASON)[keyof typeof PORTAL_STATUS_FIELD_FAIL_REASON];

/**
 * One field in the in-memory fill plan.
 * `value` stays in memory only — checkpoints persist ids/reasons, never values.
 */
export type EditMemberFieldPlanEntry = {
  fieldId: EditMemberPortalFieldId | string;
  action: EditMemberFieldPlanAction;
  /** Present only when action === fill. Never log. */
  value?: string;
  reasonCode?: EditMemberFieldPlanReasonCode;
};

/**
 * Typed Edit Member fill input built from CRM / application (REQ-019 / OQ-002).
 * Values are for fill helpers only — not for checkpoint JSON.
 */
export type EditMemberFillInput = {
  /** Application pre-start location (portal `#LocationId` option text/id). */
  location?: string;
  /** Application pre-start visa category (portal `#VisaType` option text/id). */
  visaType?: string;
  /**
   * True when pre-start visa selection is National (OQ-003 / DEC-006).
   * MA-TASK-003/005 must verify form live before Schengen-id assumptions.
   */
  nationalVisaVerifyFirst: boolean;
  /** Ordered field plan (fill | skip | unskippableGap). */
  fields: EditMemberFieldPlanEntry[];
  /** True when any happy-path required `*` has no CRM source. */
  hasUnskippableGaps: boolean;
};

/**
 * Portal-aligned CRM source for the builder (existing user-entered data only).
 * Optional extended keys (employer/inviting/…) are read when present — never invented.
 */
export type EditMemberCrmApplicantSource = {
  firstName?: string;
  lastName?: string;
  lastNameAtBirth?: string;
  otherNames?: string;
  dob?: string;
  placeOfBirth?: string;
  countryOfBirth?: string;
  nationality?: string;
  nationalityAtBirth?: string;
  gender?: string;
  maritalStatus?: string;
  nationalId?: string;
  passportNumber?: string;
  passportIssued?: string;
  passportExpires?: string;
  passportType?: string;
  passportIssueCountry?: string;
  passportIssuedBy?: string;
  phone?: string;
  address?: string;
  purpose?: string;
  firstEntry?: string;
  entries?: string;
  durationDays?: string;
  /** Extended portal-aligned keys when product already collected them. */
  employerName?: string;
  employerPhone?: string;
  employerAddress?: string;
  occupation?: string;
  previousFingerPrintStatus?: string;
  previousFingerPrintDate?: string;
  blsInvitingAuthority?: string;
  invitingAuthorityName?: string;
  invitingCountry?: string;
  invitingCity?: string;
  invitingZipCode?: string;
  invitingAddress?: string;
  invitingEmail?: string;
  invitingContactNo?: string;
  invitingFaxNo?: string;
  invitingContactName?: string;
  invitingContactSurname?: string;
  invitingContactCountry?: string;
  invitingContactCity?: string;
  invitingContactZipCode?: string;
  invitingContactAddress?: string;
  invitingContactContactNo?: string;
  invitingContactEmail?: string;
  invitingContactFaxNo?: string;
  costCoveredBy?: string;
  meansOfSupport?: string;
  isMinor?: boolean | string;
  homeAddressLine2?: string;
  homeCountry?: string;
  homeCity?: string;
  homePostalCode?: string;
  memberStateSecondDestination?: string;
  [key: string]: unknown;
};

export type EditMemberCrmApplicationSource = {
  submitCity?: string;
  visaType?: string;
  destination?: string;
  travelDate?: string;
  returnDate?: string;
};

export type EditMemberCrmSource = {
  applicant: EditMemberCrmApplicantSource;
  application: EditMemberCrmApplicationSource;
};
