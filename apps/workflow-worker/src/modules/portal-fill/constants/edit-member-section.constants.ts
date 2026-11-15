import {
  EDIT_MEMBER_CONDITIONAL_TOGGLE_FIELD_ID,
  EDIT_MEMBER_FINGERPRINT_DATE_FIELD_ID,
  EDIT_MEMBER_MINOR_FIELD_ID,
  EDIT_MEMBER_OPTIONAL_FIELD_ID,
  EDIT_MEMBER_OTHER_RESIDENCE_FIELD_ID,
  EDIT_MEMBER_PREVIOUS_VISA_FIELD_ID,
  EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID,
} from './edit-member-portal-field.constants';

/** Ordered Edit Member fill sections (spec §8 / flow.md §§5–10). */
export const EDIT_MEMBER_FILL_SECTION = {
  PERSONAL: 'personal',
  PASSPORT: 'passport',
  ADDRESS: 'address',
  EMPLOYER: 'employer',
  TRAVEL: 'travel',
  FINGERPRINT_INVITING: 'fingerprint_inviting',
  COST: 'cost',
} as const;

export type EditMemberFillSectionId =
  (typeof EDIT_MEMBER_FILL_SECTION)[keyof typeof EDIT_MEMBER_FILL_SECTION];

const R = EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID;
const O = EDIT_MEMBER_OPTIONAL_FIELD_ID;

/** Field ids belonging to each section (plan filter for resume/progress). */
export const EDIT_MEMBER_SECTION_FIELD_IDS: Record<
  EditMemberFillSectionId,
  readonly string[]
> = {
  [EDIT_MEMBER_FILL_SECTION.PERSONAL]: [
    R.FirstName,
    R.SurName,
    R.SurnameAtBirth,
    O.LastName,
    R.DateOfBirth,
    R.PlaceOfBirth,
    R.CountryOfBirthId,
    R.NationalityId,
    R.NationalityAtBirthId,
    R.GenderId,
    R.MaritalStatusId,
    EDIT_MEMBER_CONDITIONAL_TOGGLE_FIELD_ID.IsMinor,
    ...Object.values(EDIT_MEMBER_MINOR_FIELD_ID),
  ],
  [EDIT_MEMBER_FILL_SECTION.PASSPORT]: [
    O.NationalIdentityNumber,
    R.PassportType,
    R.PassportNo,
    R.IssueDate,
    R.ExpiryDate,
    R.IssuePlace,
    R.IssueCountryId,
    R.TravelDate,
  ],
  [EDIT_MEMBER_FILL_SECTION.ADDRESS]: [
    R.HomeAddressLine1,
    O.HomeAddressLine2,
    R.HomeAddressCountryId,
    R.HomeAddressCity,
    R.HomeAddressPostalCode,
    R.HomeAddressContactNumber,
    EDIT_MEMBER_CONDITIONAL_TOGGLE_FIELD_ID.HasOtherResidenceship,
    ...Object.values(EDIT_MEMBER_OTHER_RESIDENCE_FIELD_ID),
  ],
  [EDIT_MEMBER_FILL_SECTION.EMPLOYER]: [
    R.EmployerName,
    R.EmployerPhone,
    R.EmployerAddress,
    R.CurrentOccupationId,
  ],
  [EDIT_MEMBER_FILL_SECTION.TRAVEL]: [
    R.PurposeOfJourneyId,
    R.MemberStateDestinationId,
    O.MemberStateSecondDestinationId,
    R.MemberStateFirstEntryId,
    R.NumberOfEntriesRequested,
    R.IntendedStayDuration,
    EDIT_MEMBER_CONDITIONAL_TOGGLE_FIELD_ID.IsVisaIssuedBefore,
    ...Object.values(EDIT_MEMBER_PREVIOUS_VISA_FIELD_ID),
  ],
  [EDIT_MEMBER_FILL_SECTION.FINGERPRINT_INVITING]: [
    R.PreviousFingerPrintStatus,
    ...Object.values(EDIT_MEMBER_FINGERPRINT_DATE_FIELD_ID),
    R.IntendedDateOfArrival,
    R.IntendedDateOfDeparture,
    O.FinalDestinationIssuedByCountryId,
    O.FinalDestinationValidFromDate,
    O.FinalDestinationValidToDate,
    R.BlsInvitingAuthority,
    R.InvitingAuthorityName,
    R.InvitingCountryId,
    R.InvitingCity,
    R.InvitingZipCode,
    R.InvitingAddress,
    R.InvitingEmail,
    R.InvitingContactNo,
    O.InvitingFaxNo,
    R.InvitingContactName,
    R.InvitingContactSurname,
    R.InvitingContactCountryId,
    R.InvitingContactCity,
    R.InvitingContactZipCode,
    R.InvitingContactAddress,
    R.InvitingContactContactNo,
    R.InvitingContactEmail,
    O.InvitingContactFaxNo,
  ],
  [EDIT_MEMBER_FILL_SECTION.COST]: [
    R.CostCoveredById,
    R.MeansOfSupportId,
    O.OtherCitizenSurname,
    O.OtherCitizenFirstName,
    O.OtherCitizenDateOfBirth,
    O.OtherCitizenNationalityId,
    O.OtherCitizenDocumentNumber,
    O.OtherCitizenFamilyRelationshipId,
  ],
};

export const EDIT_MEMBER_FILL_SECTION_ORDER: readonly EditMemberFillSectionId[] =
  [
    EDIT_MEMBER_FILL_SECTION.PERSONAL,
    EDIT_MEMBER_FILL_SECTION.PASSPORT,
    EDIT_MEMBER_FILL_SECTION.ADDRESS,
    EDIT_MEMBER_FILL_SECTION.EMPLOYER,
    EDIT_MEMBER_FILL_SECTION.TRAVEL,
    EDIT_MEMBER_FILL_SECTION.FINGERPRINT_INVITING,
    EDIT_MEMBER_FILL_SECTION.COST,
  ];

/** Inviting company/hotel auth block (radio 0|1). */
export const EDIT_MEMBER_INVITING_AUTH_FIELD_IDS: readonly string[] = [
  R.InvitingAuthorityName,
  R.InvitingCountryId,
  R.InvitingCity,
  R.InvitingZipCode,
  R.InvitingAddress,
  R.InvitingEmail,
  R.InvitingContactNo,
  O.InvitingFaxNo,
];

/** Inviting contact-person block (radio 0|2). */
export const EDIT_MEMBER_INVITING_CONTACT_FIELD_IDS: readonly string[] = [
  R.InvitingContactName,
  R.InvitingContactSurname,
  R.InvitingContactCountryId,
  R.InvitingContactCity,
  R.InvitingContactZipCode,
  R.InvitingContactAddress,
  R.InvitingContactContactNo,
  R.InvitingContactEmail,
  O.InvitingContactFaxNo,
];
