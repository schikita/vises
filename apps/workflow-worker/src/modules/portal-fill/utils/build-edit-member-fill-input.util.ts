import {
  EDIT_MEMBER_CONDITIONAL_TOGGLE_FIELD_ID,
  EDIT_MEMBER_FINGERPRINT_DATE_FIELD_ID,
  EDIT_MEMBER_MINOR_FIELD_ID,
  EDIT_MEMBER_OPTIONAL_FIELD_ID,
  EDIT_MEMBER_OTHER_RESIDENCE_FIELD_ID,
  EDIT_MEMBER_PREVIOUS_VISA_FIELD_ID,
  EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID,
  EDIT_MEMBER_VISA_MODAL_FIELD_ID,
} from '../constants/edit-member-portal-field.constants';
import { EDIT_MEMBER_FIELD_PLAN_ACTION } from '../constants/edit-member-field-plan-action.constants';
import { EDIT_MEMBER_INVITING_AUTHORITY_VALUE } from '../constants/edit-member-inviting-authority.constants';
import {
  EDIT_MEMBER_FINGERPRINT_DEFAULT_VALUE,
  EDIT_MEMBER_INVITING_AUTHORITY_DEFAULT_VALUE,
} from '../constants/edit-member-radio-default.constants';
import {
  EDIT_MEMBER_INVITING_AUTH_FIELD_IDS,
  EDIT_MEMBER_INVITING_CONTACT_FIELD_IDS,
} from '../constants/edit-member-section.constants';
import {
  PORTAL_STATUS_FIELD_FAIL_REASON,
  PORTAL_STATUS_FIELD_SKIP_REASON,
} from '../constants/portal-status-field-reason.constants';
import type {
  EditMemberCrmSource,
  EditMemberFieldPlanEntry,
  EditMemberFillInput,
} from '../types/edit-member-fill-input.types';
import { isNationalVisaSelection } from './is-national-visa-selection.util';
import { mapEditMemberGenderPortalLabel } from './map-edit-member-gender-portal-label.util';
import { readEditMemberCrmString } from './read-edit-member-crm-string.util';

const fillEntry = (
  fieldId: string,
  value: string,
): EditMemberFieldPlanEntry => ({
  fieldId,
  action: EDIT_MEMBER_FIELD_PLAN_ACTION.FILL,
  value,
});

const skipEntry = (
  fieldId: string,
  reasonCode: EditMemberFieldPlanEntry['reasonCode'],
): EditMemberFieldPlanEntry => ({
  fieldId,
  action: EDIT_MEMBER_FIELD_PLAN_ACTION.SKIP,
  reasonCode,
});

const gapEntry = (fieldId: string): EditMemberFieldPlanEntry => ({
  fieldId,
  action: EDIT_MEMBER_FIELD_PLAN_ACTION.UNSKIPPABLE_GAP,
  reasonCode: PORTAL_STATUS_FIELD_FAIL_REASON.REQUIRED_MISSING_SOURCE,
});

/**
 * Required `*`: fill when CRM has a value; otherwise unskippable gap (OQ-007).
 * Never invent a fallback value.
 */
const planRequired = (
  fieldId: string,
  value: string | undefined,
): EditMemberFieldPlanEntry =>
  value ? fillEntry(fieldId, value) : gapEntry(fieldId);

/**
 * Optional / inactive conditional: fill when provided; else skip (OQ-007).
 */
const planOptional = (
  fieldId: string,
  value: string | undefined,
): EditMemberFieldPlanEntry =>
  value
    ? fillEntry(fieldId, value)
    : skipEntry(fieldId, PORTAL_STATUS_FIELD_SKIP_REASON.OPTIONAL_MISSING);

const isTruthyFlag = (value: unknown): boolean => {
  if (value === true) return true;
  if (typeof value !== 'string') return false;
  const collapsed = value.trim().toLowerCase();
  return collapsed === 'true' || collapsed === '1' || collapsed === 'yes';
};

/**
 * Build in-memory Edit Member fill input from existing CRM / application data
 * (REQ-019 / REQ-020 / OQ-002 / OQ-003 / OQ-007). Does not invent values.
 */
export const buildEditMemberFillInput = (
  source: EditMemberCrmSource,
): EditMemberFillInput => {
  const a = source.applicant;
  const app = source.application;
  const fields: EditMemberFieldPlanEntry[] = [];

  const location = readEditMemberCrmString(app.submitCity);
  const visaType = readEditMemberCrmString(app.visaType);
  const nationalVisaVerifyFirst = isNationalVisaSelection(visaType);

  fields.push(
    location
      ? fillEntry(EDIT_MEMBER_VISA_MODAL_FIELD_ID.LocationId, location)
      : gapEntry(EDIT_MEMBER_VISA_MODAL_FIELD_ID.LocationId),
  );
  fields.push(
    visaType
      ? fillEntry(EDIT_MEMBER_VISA_MODAL_FIELD_ID.VisaType, visaType)
      : gapEntry(EDIT_MEMBER_VISA_MODAL_FIELD_ID.VisaType),
  );

  const firstName = readEditMemberCrmString(a.firstName);
  const lastName = readEditMemberCrmString(a.lastName);
  const surnameAtBirth = readEditMemberCrmString(a.lastNameAtBirth);
  const otherNames = readEditMemberCrmString(a.otherNames);
  const dob = readEditMemberCrmString(a.dob);
  const placeOfBirth = readEditMemberCrmString(a.placeOfBirth);
  const countryOfBirth = readEditMemberCrmString(a.countryOfBirth);
  const nationality = readEditMemberCrmString(a.nationality);
  const nationalityAtBirth = readEditMemberCrmString(a.nationalityAtBirth);
  const genderRaw = readEditMemberCrmString(a.gender);
  const gender = genderRaw
    ? mapEditMemberGenderPortalLabel(genderRaw)
    : undefined;
  const maritalStatus = readEditMemberCrmString(a.maritalStatus);
  const nationalId = readEditMemberCrmString(a.nationalId);
  const passportType = readEditMemberCrmString(a.passportType);
  const passportNo = readEditMemberCrmString(a.passportNumber);
  const issueDate = readEditMemberCrmString(a.passportIssued);
  const expiryDate = readEditMemberCrmString(a.passportExpires);
  const issuePlace = readEditMemberCrmString(a.passportIssuedBy);
  const issueCountry = readEditMemberCrmString(a.passportIssueCountry);
  const travelDate = readEditMemberCrmString(app.travelDate);
  const returnDate = readEditMemberCrmString(app.returnDate);
  const address = readEditMemberCrmString(a.address);
  const homeAddressLine2 = readEditMemberCrmString(a.homeAddressLine2);
  const homeCountry = readEditMemberCrmString(a.homeCountry);
  const homeCity = readEditMemberCrmString(a.homeCity);
  const homePostalCode = readEditMemberCrmString(a.homePostalCode);
  const phone = readEditMemberCrmString(a.phone);
  const employerName = readEditMemberCrmString(a.employerName);
  const employerPhone = readEditMemberCrmString(a.employerPhone);
  const employerAddress = readEditMemberCrmString(a.employerAddress);
  const occupation = readEditMemberCrmString(a.occupation);
  const purpose = readEditMemberCrmString(a.purpose);
  const destination = readEditMemberCrmString(app.destination);
  const firstEntry = readEditMemberCrmString(a.firstEntry);
  const secondDestination = readEditMemberCrmString(
    a.memberStateSecondDestination,
  );
  const entries = readEditMemberCrmString(a.entries);
  const durationDays = readEditMemberCrmString(a.durationDays);
  const fingerprintRaw = readEditMemberCrmString(a.previousFingerPrintStatus);
  const fingerprint =
    fingerprintRaw === '0' || fingerprintRaw === '1' || fingerprintRaw === '2'
      ? fingerprintRaw
      : EDIT_MEMBER_FINGERPRINT_DEFAULT_VALUE;
  const invitingAuthorityRaw = readEditMemberCrmString(a.blsInvitingAuthority);
  const invitingAuthority =
    invitingAuthorityRaw === EDIT_MEMBER_INVITING_AUTHORITY_VALUE.COMPANY ||
    invitingAuthorityRaw === EDIT_MEMBER_INVITING_AUTHORITY_VALUE.HOTEL ||
    invitingAuthorityRaw === EDIT_MEMBER_INVITING_AUTHORITY_VALUE.PERSON
      ? invitingAuthorityRaw
      : EDIT_MEMBER_INVITING_AUTHORITY_DEFAULT_VALUE;
  const costCoveredBy = readEditMemberCrmString(a.costCoveredBy);
  const meansOfSupport = readEditMemberCrmString(a.meansOfSupport);

  const R = EDIT_MEMBER_REQUIRED_HAPPY_PATH_FIELD_ID;
  const O = EDIT_MEMBER_OPTIONAL_FIELD_ID;

  fields.push(planRequired(R.FirstName, firstName));
  fields.push(planRequired(R.SurName, lastName));
  fields.push(planRequired(R.SurnameAtBirth, surnameAtBirth));
  fields.push(planOptional(O.LastName, otherNames));
  fields.push(planRequired(R.DateOfBirth, dob));
  fields.push(planRequired(R.PlaceOfBirth, placeOfBirth));
  fields.push(planRequired(R.CountryOfBirthId, countryOfBirth));
  fields.push(planRequired(R.NationalityId, nationality));
  fields.push(planRequired(R.NationalityAtBirthId, nationalityAtBirth));
  fields.push(planRequired(R.GenderId, gender));
  fields.push(planRequired(R.MaritalStatusId, maritalStatus));
  fields.push(planOptional(O.NationalIdentityNumber, nationalId));
  fields.push(planRequired(R.PassportType, passportType));
  fields.push(planRequired(R.PassportNo, passportNo));
  fields.push(planRequired(R.IssueDate, issueDate));
  fields.push(planRequired(R.ExpiryDate, expiryDate));
  fields.push(planRequired(R.IssuePlace, issuePlace));
  fields.push(planRequired(R.IssueCountryId, issueCountry));
  fields.push(planRequired(R.TravelDate, travelDate));
  fields.push(planRequired(R.HomeAddressLine1, address));
  fields.push(planOptional(O.HomeAddressLine2, homeAddressLine2));
  fields.push(planRequired(R.HomeAddressCountryId, homeCountry));
  fields.push(planRequired(R.HomeAddressCity, homeCity));
  fields.push(planRequired(R.HomeAddressPostalCode, homePostalCode));
  fields.push(planRequired(R.HomeAddressContactNumber, phone));
  fields.push(planRequired(R.EmployerName, employerName));
  fields.push(planRequired(R.EmployerPhone, employerPhone));
  fields.push(planRequired(R.EmployerAddress, employerAddress));
  fields.push(planRequired(R.CurrentOccupationId, occupation));
  fields.push(planRequired(R.PurposeOfJourneyId, purpose));
  fields.push(planRequired(R.MemberStateDestinationId, destination));
  fields.push(planOptional(O.MemberStateSecondDestinationId, secondDestination));
  fields.push(planRequired(R.MemberStateFirstEntryId, firstEntry));
  fields.push(planRequired(R.NumberOfEntriesRequested, entries));
  fields.push(planRequired(R.IntendedStayDuration, durationDays));
  fields.push(planRequired(R.IntendedDateOfArrival, travelDate));
  fields.push(planRequired(R.IntendedDateOfDeparture, returnDate));
  fields.push(planRequired(R.PreviousFingerPrintStatus, fingerprint));
  fields.push(planRequired(R.BlsInvitingAuthority, invitingAuthority));

  // Gate inviting company vs contact by BlsInvitingAuthority (REQ-011/012).
  const needsInvitingAuth =
    invitingAuthority === EDIT_MEMBER_INVITING_AUTHORITY_VALUE.COMPANY ||
    invitingAuthority === EDIT_MEMBER_INVITING_AUTHORITY_VALUE.HOTEL;
  const needsInvitingContact =
    invitingAuthority === EDIT_MEMBER_INVITING_AUTHORITY_VALUE.COMPANY ||
    invitingAuthority === EDIT_MEMBER_INVITING_AUTHORITY_VALUE.PERSON;

  const invitingAuthCrmByFieldId: Record<string, string | undefined> = {
    [R.InvitingAuthorityName]: readEditMemberCrmString(a.invitingAuthorityName),
    [R.InvitingCountryId]: readEditMemberCrmString(a.invitingCountry),
    [R.InvitingCity]: readEditMemberCrmString(a.invitingCity),
    [R.InvitingZipCode]: readEditMemberCrmString(a.invitingZipCode),
    [R.InvitingAddress]: readEditMemberCrmString(a.invitingAddress),
    [R.InvitingEmail]: readEditMemberCrmString(a.invitingEmail),
    [R.InvitingContactNo]: readEditMemberCrmString(a.invitingContactNo),
    [O.InvitingFaxNo]: readEditMemberCrmString(a.invitingFaxNo),
  };
  for (const fieldId of EDIT_MEMBER_INVITING_AUTH_FIELD_IDS) {
    if (!needsInvitingAuth) {
      fields.push(
        skipEntry(
          fieldId,
          PORTAL_STATUS_FIELD_SKIP_REASON.CONDITIONAL_SECTION_INACTIVE,
        ),
      );
      continue;
    }
    const value = invitingAuthCrmByFieldId[fieldId];
    if (fieldId === O.InvitingFaxNo) {
      fields.push(planOptional(fieldId, value));
    } else {
      fields.push(planRequired(fieldId, value));
    }
  }

  const invitingContactCrmByFieldId: Record<string, string | undefined> = {
    [R.InvitingContactName]: readEditMemberCrmString(a.invitingContactName),
    [R.InvitingContactSurname]: readEditMemberCrmString(
      a.invitingContactSurname,
    ),
    [R.InvitingContactCountryId]: readEditMemberCrmString(
      a.invitingContactCountry,
    ),
    [R.InvitingContactCity]: readEditMemberCrmString(a.invitingContactCity),
    [R.InvitingContactZipCode]: readEditMemberCrmString(
      a.invitingContactZipCode,
    ),
    [R.InvitingContactAddress]: readEditMemberCrmString(
      a.invitingContactAddress,
    ),
    [R.InvitingContactContactNo]: readEditMemberCrmString(
      a.invitingContactContactNo,
    ),
    [R.InvitingContactEmail]: readEditMemberCrmString(a.invitingContactEmail),
    [O.InvitingContactFaxNo]: readEditMemberCrmString(
      a.invitingContactFaxNo,
    ),
  };
  for (const fieldId of EDIT_MEMBER_INVITING_CONTACT_FIELD_IDS) {
    if (!needsInvitingContact) {
      fields.push(
        skipEntry(
          fieldId,
          PORTAL_STATUS_FIELD_SKIP_REASON.CONDITIONAL_SECTION_INACTIVE,
        ),
      );
      continue;
    }
    const value = invitingContactCrmByFieldId[fieldId];
    if (fieldId === O.InvitingContactFaxNo) {
      fields.push(planOptional(fieldId, value));
    } else {
      fields.push(planRequired(fieldId, value));
    }
  }

  fields.push(planRequired(R.CostCoveredById, costCoveredBy));
  fields.push(planRequired(R.MeansOfSupportId, meansOfSupport));

  // Conditional sections: inactive by default when CRM has no enabling data.
  const isMinor = isTruthyFlag(a.isMinor);
  fields.push(
    isMinor
      ? fillEntry(EDIT_MEMBER_CONDITIONAL_TOGGLE_FIELD_ID.IsMinor, 'true')
      : skipEntry(
          EDIT_MEMBER_CONDITIONAL_TOGGLE_FIELD_ID.IsMinor,
          PORTAL_STATUS_FIELD_SKIP_REASON.CONDITIONAL_SECTION_INACTIVE,
        ),
  );
  for (const fieldId of Object.values(EDIT_MEMBER_MINOR_FIELD_ID)) {
    if (isMinor) {
      const value = readEditMemberCrmString(a[fieldId]);
      fields.push(planRequired(fieldId, value));
    } else {
      fields.push(
        skipEntry(
          fieldId,
          PORTAL_STATUS_FIELD_SKIP_REASON.CONDITIONAL_SECTION_INACTIVE,
        ),
      );
    }
  }

  const hasOtherResidence = isTruthyFlag(a['hasOtherResidenceship']);
  fields.push(
    hasOtherResidence
      ? fillEntry(
          EDIT_MEMBER_CONDITIONAL_TOGGLE_FIELD_ID.HasOtherResidenceship,
          'true',
        )
      : skipEntry(
          EDIT_MEMBER_CONDITIONAL_TOGGLE_FIELD_ID.HasOtherResidenceship,
          PORTAL_STATUS_FIELD_SKIP_REASON.CONDITIONAL_SECTION_INACTIVE,
        ),
  );
  for (const fieldId of Object.values(EDIT_MEMBER_OTHER_RESIDENCE_FIELD_ID)) {
    if (hasOtherResidence) {
      fields.push(
        planRequired(fieldId, readEditMemberCrmString(a[fieldId])),
      );
    } else {
      fields.push(
        skipEntry(
          fieldId,
          PORTAL_STATUS_FIELD_SKIP_REASON.CONDITIONAL_SECTION_INACTIVE,
        ),
      );
    }
  }

  const visaIssuedBefore = isTruthyFlag(a['isVisaIssuedBefore']);
  fields.push(
    visaIssuedBefore
      ? fillEntry(
          EDIT_MEMBER_CONDITIONAL_TOGGLE_FIELD_ID.IsVisaIssuedBefore,
          'true',
        )
      : skipEntry(
          EDIT_MEMBER_CONDITIONAL_TOGGLE_FIELD_ID.IsVisaIssuedBefore,
          PORTAL_STATUS_FIELD_SKIP_REASON.CONDITIONAL_SECTION_INACTIVE,
        ),
  );
  for (const fieldId of Object.values(EDIT_MEMBER_PREVIOUS_VISA_FIELD_ID)) {
    if (visaIssuedBefore) {
      fields.push(
        planRequired(fieldId, readEditMemberCrmString(a[fieldId])),
      );
    } else {
      fields.push(
        skipEntry(
          fieldId,
          PORTAL_STATUS_FIELD_SKIP_REASON.CONDITIONAL_SECTION_INACTIVE,
        ),
      );
    }
  }

  const fingerprintNeedsDate = fingerprint === '0';
  for (const fieldId of Object.values(EDIT_MEMBER_FINGERPRINT_DATE_FIELD_ID)) {
    if (fingerprintNeedsDate) {
      fields.push(
        planRequired(fieldId, readEditMemberCrmString(a[fieldId])),
      );
    } else {
      fields.push(
        skipEntry(
          fieldId,
          PORTAL_STATUS_FIELD_SKIP_REASON.CONDITIONAL_SECTION_INACTIVE,
        ),
      );
    }
  }

  // Entry-permit + EU family: optional unless CRM provided values.
  fields.push(
    planOptional(
      O.FinalDestinationIssuedByCountryId,
      readEditMemberCrmString(a['finalDestinationIssuedByCountry']),
    ),
  );
  fields.push(
    planOptional(
      O.FinalDestinationValidFromDate,
      readEditMemberCrmString(a['finalDestinationValidFromDate']),
    ),
  );
  fields.push(
    planOptional(
      O.FinalDestinationValidToDate,
      readEditMemberCrmString(a['finalDestinationValidToDate']),
    ),
  );
  fields.push(
    planOptional(
      O.OtherCitizenSurname,
      readEditMemberCrmString(a['otherCitizenSurname']),
    ),
  );
  fields.push(
    planOptional(
      O.OtherCitizenFirstName,
      readEditMemberCrmString(a['otherCitizenFirstName']),
    ),
  );
  fields.push(
    planOptional(
      O.OtherCitizenDateOfBirth,
      readEditMemberCrmString(a['otherCitizenDateOfBirth']),
    ),
  );
  fields.push(
    planOptional(
      O.OtherCitizenNationalityId,
      readEditMemberCrmString(a['otherCitizenNationality']),
    ),
  );
  fields.push(
    planOptional(
      O.OtherCitizenDocumentNumber,
      readEditMemberCrmString(a['otherCitizenDocumentNumber']),
    ),
  );
  fields.push(
    planOptional(
      O.OtherCitizenFamilyRelationshipId,
      readEditMemberCrmString(a['otherCitizenFamilyRelationship']),
    ),
  );

  const hasUnskippableGaps = fields.some(
    (entry) => entry.action === EDIT_MEMBER_FIELD_PLAN_ACTION.UNSKIPPABLE_GAP,
  );

  return {
    ...(location ? { location } : {}),
    ...(visaType ? { visaType } : {}),
    nationalVisaVerifyFirst,
    fields,
    hasUnskippableGaps,
  };
};
