/**
 * Entry-permit (final destination) fields from manage_applicant(form).html §10.
 * Intended arrival/departure dates stay on application-detail (OQ-FE-002).
 */
export const PORTAL_FORM_ENTRY_PERMIT_FIELD_KEYS = [
  'finalDestinationIssuedByCountry',
  'finalDestinationValidFromDate',
  'finalDestinationValidToDate',
] as const
