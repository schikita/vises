import type { ClientPortalFormConditionals } from '@vises/contracts';
import type { FieldResult } from './portal-field.types';

/** Applicant shape used by mapping (subset of SPA Applicant + optional gap fields). */
export interface ApplicantInput {
  id: string;
  firstName?: string;
  lastName?: string;
  lastNameAtBirth?: string;
  dob?: string;
  placeOfBirth?: string;
  countryOfBirth?: string;
  nationality?: string;
  nationalityAtBirth?: string;
  nationalId?: string;
  otherNames?: string;
  gender?: string;
  maritalStatus?: string;
  passportNumber?: string;
  passportIssued?: string;
  passportExpires?: string;
  /** Optional — may be present when SPA saved; absent on seed p-anna */
  passportType?: string;
  /**
   * Passport Issue Country (portal `#BirthCountry`). English portal label.
   * Distinct from CRM `countryOfBirth` («Страна рождения»).
   */
  passportIssueCountry?: string;
  passportIssuedBy?: string;
  email?: string;
  phone?: string;
  /** Freeform home address (Edit Member `#HomeAddressLine1` when structured parts absent). */
  address?: string;
  purpose?: string;
  firstEntry?: string;
  entries?: string;
  durationDays?: string;
  relationship?: string;
  /** Portal form plaintext (APF / REQ-007) — omitted when Client column null/blank. */
  homeAddressLine2?: string;
  homeCountry?: string;
  homeCity?: string;
  homePostalCode?: string;
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
  memberStateSecondDestination?: string;
  /** Conditional-section bag from Client (optional fill only). */
  portalFormConditionals?: ClientPortalFormConditionals;
  isMinor?: boolean | string;
  [key: string]: unknown;
}

export interface ApplicationInput {
  id: string;
  clientEmail?: string;
  submitCountry?: string;
  applicants?: ApplicantInput[];
  [key: string]: unknown;
}

export interface MappingResult {
  applicationId: string;
  applicantId: string;
  fields: FieldResult[];
  /** True when every required fill target is filled or intentionally skipped. */
  ok: boolean;
  metadata: {
    nameMappingProvisional: true;
    notes: string[];
  };
}

export interface LoadedApplicationData {
  application: ApplicationInput;
  applicant: ApplicantInput;
  source: 'database';
}

/** Options for PortalDataService.load (DB only — DEC-003). */
export interface LoadApplicationOptions {
  applicationId: string;
  applicantId: string;
}

/**
 * Options for PortalFieldMapperService.mapFields.
 * Primary OTP path creates temporary email after captcha and fills `#Email` in the
 * pipeline (DEC-001). `emailOverride` is optional legacy map-time override only.
 * `otpPathArmed` marks EmailOtp as deferred to post-captcha temporary-mailbox fill.
 */
export interface MapFieldsOptions {
  emailOverride?: string;
  otpPathArmed?: boolean;
}
