/**
 * Plaintext Client columns mapped into ApplicantInput (APF / DEC-002).
 * Not on PII_ENCRYPTED_FIELD_KEYS — copied as-is when non-empty.
 */
export const CLIENT_PORTAL_PLAINTEXT_FIELD_KEYS = [
  'homeAddressLine2',
  'homeCountry',
  'homeCity',
  'homePostalCode',
  'employerName',
  'employerPhone',
  'employerAddress',
  'occupation',
  'previousFingerPrintStatus',
  'previousFingerPrintDate',
  'blsInvitingAuthority',
  'invitingAuthorityName',
  'invitingCountry',
  'invitingCity',
  'invitingZipCode',
  'invitingAddress',
  'invitingEmail',
  'invitingContactNo',
  'invitingFaxNo',
  'invitingContactName',
  'invitingContactSurname',
  'invitingContactCountry',
  'invitingContactCity',
  'invitingContactZipCode',
  'invitingContactAddress',
  'invitingContactContactNo',
  'invitingContactEmail',
  'invitingContactFaxNo',
  'costCoveredBy',
  'meansOfSupport',
  'memberStateSecondDestination',
] as const;

export type ClientPortalPlaintextFieldKey =
  (typeof CLIENT_PORTAL_PLAINTEXT_FIELD_KEYS)[number];
