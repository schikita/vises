/**
 * Edit Member / ManageApplicant portal field ids (spec §8 / flow.md §§5–10).
 * Values are DOM `#id` / control names — never invent CRM values here.
 */

/** Visa modal (top document) — location / visa category. */
export const EDIT_MEMBER_VISA_MODAL_FIELD_ID = {
  LocationId: 'LocationId',
  VisaType: 'VisaType',
} as const;

/**
 * Happy-path required field ids (adult, no optional sections, inviting = company).
 * Fingerprint / inviting radios use `name` (duplicate ids in DOM — brief §1.4).
 */
export const EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID = {
  FirstName: 'FirstName',
  SurName: 'SurName',
  SurnameAtBirth: 'SurnameAtBirth',
  DateOfBirth: 'DateOfBirth',
  PlaceOfBirth: 'PlaceOfBirth',
  CountryOfBirthId: 'CountryOfBirthId',
  NationalityId: 'NationalityId',
  NationalityAtBirthId: 'NationalityAtBirthId',
  GenderId: 'GenderId',
  MaritalStatusId: 'MaritalStatusId',
  PassportType: 'PassportType',
  PassportNo: 'PassportNo',
  IssueDate: 'IssueDate',
  ExpiryDate: 'ExpiryDate',
  IssuePlace: 'IssuePlace',
  IssueCountryId: 'IssueCountryId',
  TravelDate: 'TravelDate',
  HomeAddressLine1: 'HomeAddressLine1',
  HomeAddressCountryId: 'HomeAddressCountryId',
  HomeAddressCity: 'HomeAddressCity',
  HomeAddressPostalCode: 'HomeAddressPostalCode',
  HomeAddressContactNumber: 'HomeAddressContactNumber',
  EmployerName: 'EmployerName',
  EmployerPhone: 'EmployerPhone',
  EmployerAddress: 'EmployerAddress',
  CurrentOccupationId: 'CurrentOccupationId',
  PurposeOfJourneyId: 'PurposeOfJourneyId',
  MemberStateDestinationId: 'MemberStateDestinationId',
  MemberStateFirstEntryId: 'MemberStateFirstEntryId',
  NumberOfEntriesRequested: 'NumberOfEntriesRequested',
  IntendedStayDuration: 'IntendedStayDuration',
  IntendedDateOfArrival: 'IntendedDateOfArrival',
  IntendedDateOfDeparture: 'IntendedDateOfDeparture',
  PreviousFingerPrintStatus: 'PreviousFingerPrintStatus',
  BlsInvitingAuthority: 'BlsInvitingAuthority',
  InvitingAuthorityName: 'InvitingAuthorityName',
  InvitingCountryId: 'InvitingCountryId',
  InvitingCity: 'InvitingCity',
  InvitingZipCode: 'InvitingZipCode',
  InvitingAddress: 'InvitingAddress',
  InvitingEmail: 'InvitingEmail',
  InvitingContactNo: 'InvitingContactNo',
  InvitingContactName: 'InvitingContactName',
  InvitingContactSurname: 'InvitingContactSurname',
  InvitingContactCountryId: 'InvitingContactCountryId',
  InvitingContactCity: 'InvitingContactCity',
  InvitingContactZipCode: 'InvitingContactZipCode',
  InvitingContactAddress: 'InvitingContactAddress',
  InvitingContactContactNo: 'InvitingContactContactNo',
  InvitingContactEmail: 'InvitingContactEmail',
  CostCoveredById: 'CostCoveredById',
  MeansOfSupportId: 'MeansOfSupportId',
} as const;

/** Optional fields (no `*` when section inactive / adult happy path). */
export const EDIT_MEMBER_OPTIONAL_FIELD_ID = {
  LastName: 'LastName',
  NationalIdentityNumber: 'NationalIdentityNumber',
  HomeAddressLine2: 'HomeAddressLine2',
  MemberStateSecondDestinationId: 'MemberStateSecondDestinationId',
  InvitingFaxNo: 'InvitingFaxNo',
  InvitingContactFaxNo: 'InvitingContactFaxNo',
  FinalDestinationIssuedByCountryId: 'FinalDestinationIssuedByCountryId',
  FinalDestinationValidFromDate: 'FinalDestinationValidFromDate',
  FinalDestinationValidToDate: 'FinalDestinationValidToDate',
  OtherCitizenSurname: 'OtherCitizenSurname',
  OtherCitizenFirstName: 'OtherCitizenFirstName',
  OtherCitizenDateOfBirth: 'OtherCitizenDateOfBirth',
  OtherCitizenNationalityId: 'OtherCitizenNationalityId',
  OtherCitizenDocumentNumber: 'OtherCitizenDocumentNumber',
  OtherCitizenFamilyRelationshipId: 'OtherCitizenFamilyRelationshipId',
} as const;

/** Conditional section toggles (checkboxes). */
export const EDIT_MEMBER_CONDITIONAL_TOGGLE_FIELD_ID = {
  IsMinor: 'IsMinor',
  HasOtherResidenceship: 'HasOtherResidenceship',
  IsVisaIssuedBefore: 'IsVisaIssuedBefore',
} as const;

/** Nested fields required when `#IsMinor` is checked. */
export const EDIT_MEMBER_MINOR_FIELD_ID = {
  MinorParentSurname: 'MinorParentSurname',
  MinorParentFirstName: 'MinorParentFirstName',
  MinorParentLastName: 'MinorParentLastName',
  MinorParentNationalityId: 'MinorParentNationalityId',
  MinorParentAddress: 'MinorParentAddress',
} as const;

/** Nested fields when `#HasOtherResidenceship` is checked. */
export const EDIT_MEMBER_OTHER_RESIDENCE_FIELD_ID = {
  OtherResidenceshipPermitValidUntill: 'OtherResidenceshipPermitValidUntill',
} as const;

/** Nested fields when `#IsVisaIssuedBefore` is checked. */
export const EDIT_MEMBER_PREVIOUS_VISA_FIELD_ID = {
  PreviousVisaValidFrom: 'PreviousVisaValidFrom',
  PreviousVisaValidTo: 'PreviousVisaValidTo',
} as const;

/** Nested when fingerprint radio value `0`. */
export const EDIT_MEMBER_FINGERPRINT_DATE_FIELD_ID = {
  PreviousFingerPrintDate: 'PreviousFingerPrintDate',
} as const;

/** All Edit Member field ids we map (required + optional + conditional). */
export const EDIT_MEMBER_PORTAL_FIELD_ID = {
  ...EDIT_MEMBER_VISA_MODAL_FIELD_ID,
  ...EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID,
  ...EDIT_MEMBER_OPTIONAL_FIELD_ID,
  ...EDIT_MEMBER_CONDITIONAL_TOGGLE_FIELD_ID,
  ...EDIT_MEMBER_MINOR_FIELD_ID,
  ...EDIT_MEMBER_OTHER_RESIDENCE_FIELD_ID,
  ...EDIT_MEMBER_PREVIOUS_VISA_FIELD_ID,
  ...EDIT_MEMBER_FINGERPRINT_DATE_FIELD_ID,
} as const;
