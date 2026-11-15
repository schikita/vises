/**
 * Optional jsonb bag for portal Edit Member conditional sections
 * (minor / other residence / previous visa / entry-permit / EU family).
 * Persist/read only — not completeness-required on happy-path adult (CON-004).
 * Never holds FR-6 ciphertext (CON-003 / DEC-002).
 */
export type ClientPortalFormConditionals = {
  isMinor?: boolean | string | null;
  minorParentSurname?: string | null;
  minorParentFirstName?: string | null;
  minorParentLastName?: string | null;
  minorParentNationality?: string | null;
  minorParentAddress?: string | null;
  hasOtherResidenceship?: boolean | string | null;
  otherResidenceshipPermitValidUntil?: string | null;
  isVisaIssuedBefore?: boolean | string | null;
  previousVisaValidFrom?: string | null;
  previousVisaValidTo?: string | null;
  finalDestinationIssuedByCountry?: string | null;
  finalDestinationValidFromDate?: string | null;
  finalDestinationValidToDate?: string | null;
  otherCitizenSurname?: string | null;
  otherCitizenFirstName?: string | null;
  otherCitizenDateOfBirth?: string | null;
  otherCitizenNationality?: string | null;
  otherCitizenDocumentNumber?: string | null;
  otherCitizenFamilyRelationship?: string | null;
};
