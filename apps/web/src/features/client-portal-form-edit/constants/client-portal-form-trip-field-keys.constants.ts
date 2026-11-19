/**
 * Location / visa type fields shown in the trip subsection.
 * Member State Destination is a trip value edited in the travel section.
 */
export const PORTAL_FORM_TRIP_SECTION_FIELD_KEYS = [
  'submitCity',
  'visaType',
  'visaSubType',
  'category',
] as const

/**
 * Application trip values saved by the apps upsert.
 * Includes Member State Destination (`destination`).
 */
export const PORTAL_FORM_TRIP_FIELD_KEYS = [
  ...PORTAL_FORM_TRIP_SECTION_FIELD_KEYS,
  'destination',
] as const
