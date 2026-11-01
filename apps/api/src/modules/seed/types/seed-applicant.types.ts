/**
 * Plaintext passport + contact payload used while building FR-11 Client rows.
 * Passport subset is encrypted via PiiModule before persistence.
 */
export type SeedApplicant = {
  id: string;
  firstName: string;
  lastName: string;
  lastNameAtBirth: string;
  dob: string;
  placeOfBirth: string;
  countryOfBirth: string;
  nationality: string;
  nationalityAtBirth: string;
  gender: 'female' | 'male';
  maritalStatus: string;
  passportType: string;
  passportIssueCountry: string;
  passportNumber: string;
  passportIssued: string;
  passportExpires: string;
  passportIssuedBy: string;
  nationalId: string | null;
  otherNames: string | null;
  phone: string;
  email: string;
};
