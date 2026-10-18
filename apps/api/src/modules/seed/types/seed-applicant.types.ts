import type { ApplicationApplicant } from '../../database/types';

/**
 * Applicant payload shape written into seeded applications.
 * Required subset of `ApplicationApplicant` (jsonb on `applications`).
 */
export type SeedApplicant = ApplicationApplicant & {
  id: string;
  firstName: string;
  lastName: string;
  lastNameAtBirth: string;
  dob: string;
  placeOfBirth: string;
  countryOfBirth: string;
  nationality: string;
  gender: 'female' | 'male';
  maritalStatus: string;
  passportType: string;
  /** Passport Issue Country (portal `#BirthCountry`); CON-003 English label. */
  passportIssueCountry: string;
  passportNumber: string;
  passportIssued: string;
  passportExpires: string;
  passportIssuedBy: string;
  phone: string;
};
