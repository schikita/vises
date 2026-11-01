/**
 * Decrypted passport field set for the companion GET …/passport path (AC-10).
 * Same keys as `@vises/contracts` ClientPassportUpdateDto / FR-6 encrypted set.
 * Detail reads use ClientDetailDto instead; never logged as plaintext.
 */
export type ClientPassportPlainOut = {
  passportNumber: string | null;
  passportIssued: string | null;
  passportExpires: string | null;
  passportType: string | null;
  passportIssueCountry: string | null;
  passportIssuedBy: string | null;
  firstName: string | null;
  lastName: string | null;
  lastNameAtBirth: string | null;
  dob: string | null;
  placeOfBirth: string | null;
  countryOfBirth: string | null;
  nationality: string | null;
  nationalityAtBirth: string | null;
  nationalId: string | null;
  otherNames: string | null;
  gender: string | null;
  maritalStatus: string | null;
};
