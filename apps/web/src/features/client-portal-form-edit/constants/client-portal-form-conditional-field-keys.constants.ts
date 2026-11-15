/**
 * Flattened ClientPortalFormConditionals keys for the form model.
 * Flag keys are stored as form strings ('true' / 'false' / '').
 */
export const PORTAL_FORM_CONDITIONAL_FLAG_FIELD_KEYS = [
  'isMinor',
  'hasOtherResidenceship',
  'isVisaIssuedBefore',
] as const

export const PORTAL_FORM_CONDITIONAL_STRING_FIELD_KEYS = [
  'minorParentSurname',
  'minorParentFirstName',
  'minorParentLastName',
  'minorParentNationality',
  'minorParentAddress',
  'otherResidenceshipPermitValidUntil',
  'previousVisaValidFrom',
  'previousVisaValidTo',
  'finalDestinationIssuedByCountry',
  'finalDestinationValidFromDate',
  'finalDestinationValidToDate',
  'otherCitizenSurname',
  'otherCitizenFirstName',
  'otherCitizenDateOfBirth',
  'otherCitizenNationality',
  'otherCitizenDocumentNumber',
  'otherCitizenFamilyRelationship',
] as const

export const PORTAL_FORM_CONDITIONAL_FIELD_KEYS = [
  ...PORTAL_FORM_CONDITIONAL_FLAG_FIELD_KEYS,
  ...PORTAL_FORM_CONDITIONAL_STRING_FIELD_KEYS,
] as const
