/**
 * FE mirror of Start Completeness required keys + phone digit length (AC-07).
 *
 * Source of truth (do NOT import from apps/api):
 * `apps/api/src/modules/bls-workflow/constants/bls-applicant-completeness.constants.ts`
 * → `BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS`
 * → `BLS_APPLICANT_COMPLETENESS_PHONE_DIGITS_LENGTH`
 *
 * Keep this array in key-parity with that API file. Branch-aware inviting /
 * conditional keys are additional FE refinements beyond this always-required
 * company-centric API list (DEC-PF-006/007, OQ-PF-006).
 *
 * Schema case checklist (see also
 * `docs/sdd/portal-form-data-collection/06-portal-one-page-schema-cases.md`):
 * - company inviting → auth + contact required
 * - hotel inviting → auth required; contact not
 * - inactive minor → parent fields not required
 * - fingerprint date when status=`0`
 * - Travel Date / Intended Arrival share `travelDate` store
 */

/** Portal Mobile mapping: national phone digit count after `\D` strip. */
export const BLS_APPLICANT_COMPLETENESS_PHONE_DIGITS_LENGTH = 9

/**
 * Per-applicant required string fields (trim; empty/whitespace = missing).
 * `phone` also has a digit-length format rule after the required check.
 * Excludes: homeAddressLine2, previousFingerPrint*, memberStateSecondDestination,
 * inviting fax fields, portalFormConditionals (CON-004).
 */
export const BLS_APPLICANT_COMPLETENESS_REQUIRED_FIELD_KEYS = [
  'firstName',
  'lastName',
  'lastNameAtBirth',
  'dob',
  'countryOfBirth',
  'passportNumber',
  'passportIssued',
  'passportExpires',
  'passportType',
  'passportIssueCountry',
  'passportIssuedBy',
  'phone',
  'address',
  'homeCountry',
  'homeCity',
  'homePostalCode',
  'purpose',
  'firstEntry',
  'entries',
  'durationDays',
  'employerName',
  'employerPhone',
  'employerAddress',
  'occupation',
  'blsInvitingAuthority',
  'invitingAuthorityName',
  'invitingCountry',
  'invitingCity',
  'invitingZipCode',
  'invitingAddress',
  'invitingEmail',
  'invitingContactNo',
  'invitingContactName',
  'invitingContactSurname',
  'invitingContactCountry',
  'invitingContactCity',
  'invitingContactZipCode',
  'invitingContactAddress',
  'invitingContactContactNo',
  'invitingContactEmail',
  'costCoveredBy',
  'meansOfSupport',
] as const
