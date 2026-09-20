/** Applicant payload shape written into seeded applications. */
export type SeedApplicant = {
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
  passportNumber: string;
  passportIssued: string;
  passportExpires: string;
  passportIssuedBy: string;
  phone: string;
};
