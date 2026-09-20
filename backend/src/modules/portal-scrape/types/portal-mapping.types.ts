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
  passportNumber?: string;
  passportIssued?: string;
  passportExpires?: string;
  /** Optional — may be present when SPA saved; absent on seed p-anna */
  passportType?: string;
  passportIssuedBy?: string;
  email?: string;
  phone?: string;
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
 * Primary OTP path creates Mail.tm after captcha and fills `#Email` in the
 * pipeline (DEC-001). `emailOverride` is optional legacy map-time override only.
 * `otpPathArmed` marks EmailOtp as deferred to post-CapMonster Mail.tm fill.
 */
export interface MapFieldsOptions {
  emailOverride?: string;
  otpPathArmed?: boolean;
}
