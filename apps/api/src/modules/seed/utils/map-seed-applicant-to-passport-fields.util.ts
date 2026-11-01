import type { PiiEncryptedFieldMap } from '../../pii';
import type { SeedApplicant } from '../types';

/** Map plaintext seed applicant → FR-6 encryptable field map. */
export const mapSeedApplicantToPassportFields = (
  applicant: SeedApplicant,
): PiiEncryptedFieldMap => {
  return {
    passportNumber: applicant.passportNumber,
    passportIssued: applicant.passportIssued,
    passportExpires: applicant.passportExpires,
    passportType: applicant.passportType,
    passportIssueCountry: applicant.passportIssueCountry,
    passportIssuedBy: applicant.passportIssuedBy,
    firstName: applicant.firstName,
    lastName: applicant.lastName,
    lastNameAtBirth: applicant.lastNameAtBirth,
    dob: applicant.dob,
    placeOfBirth: applicant.placeOfBirth,
    countryOfBirth: applicant.countryOfBirth,
    nationality: applicant.nationality,
    nationalityAtBirth: applicant.nationalityAtBirth,
    nationalId: applicant.nationalId,
    otherNames: applicant.otherNames,
    gender: applicant.gender,
    maritalStatus: applicant.maritalStatus,
  };
};
