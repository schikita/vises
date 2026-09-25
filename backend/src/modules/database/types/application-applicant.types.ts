/**
 * Applicant object stored in `applications.applicants` jsonb (camelCase keys).
 * Includes portal RegisterUser fields `passportType` / `passportIssueCountry`.
 */
export type ApplicationApplicant = {
  id: string;
  firstName?: string;
  lastName?: string;
  lastNameAtBirth?: string;
  dob?: string;
  placeOfBirth?: string;
  countryOfBirth?: string;
  nationality?: string;
  gender?: string;
  maritalStatus?: string;
  passportNumber?: string;
  passportIssued?: string;
  passportExpires?: string;
  /** Exact portal PassportType label (CON-002). */
  passportType?: string;
  /**
   * Passport Issue Country — portal `#BirthCountry` label (CON-003).
   * Distinct from `countryOfBirth` / `passportIssuedBy`.
   */
  passportIssueCountry?: string;
  passportIssuedBy?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  otherNames?: string;
  nationalityAtBirth?: string;
  nationalId?: string;
  address?: string;
  purpose?: string;
  firstEntry?: string;
  entries?: string;
  durationDays?: string;
  [key: string]: unknown;
};
