/**
 * ClientPortalFormConditionals camelCase → Edit Member CRM / portal field keys
 * that `buildEditMemberFillInput` reads via `a[fieldId]` or camelCase flags.
 */
export const EDIT_MEMBER_CRM_CONDITIONALS_KEY_MAP = {
  isMinor: 'isMinor',
  hasOtherResidenceship: 'hasOtherResidenceship',
  isVisaIssuedBefore: 'isVisaIssuedBefore',
  minorParentSurname: 'MinorParentSurname',
  minorParentFirstName: 'MinorParentFirstName',
  minorParentLastName: 'MinorParentLastName',
  minorParentNationality: 'MinorParentNationalityId',
  minorParentAddress: 'MinorParentAddress',
  otherResidenceshipPermitValidUntil: 'OtherResidenceshipPermitValidUntill',
  previousVisaValidFrom: 'PreviousVisaValidFrom',
  previousVisaValidTo: 'PreviousVisaValidTo',
  finalDestinationIssuedByCountry: 'finalDestinationIssuedByCountry',
  finalDestinationValidFromDate: 'finalDestinationValidFromDate',
  finalDestinationValidToDate: 'finalDestinationValidToDate',
  otherCitizenSurname: 'otherCitizenSurname',
  otherCitizenFirstName: 'otherCitizenFirstName',
  otherCitizenDateOfBirth: 'otherCitizenDateOfBirth',
  otherCitizenNationality: 'otherCitizenNationality',
  otherCitizenDocumentNumber: 'otherCitizenDocumentNumber',
  otherCitizenFamilyRelationship: 'otherCitizenFamilyRelationship',
} as const;
