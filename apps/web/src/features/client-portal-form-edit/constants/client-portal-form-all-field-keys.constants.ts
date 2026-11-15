import { PORTAL_FORM_CONDITIONAL_FIELD_KEYS } from './client-portal-form-conditional-field-keys.constants'
import { PORTAL_FORM_PASSPORT_FIELD_KEYS } from './client-portal-form-passport-field-keys.constants'
import { PORTAL_FORM_STRING_FIELD_KEYS } from './client-portal-form-string-field-keys.constants'
import { PORTAL_FORM_TRIP_FIELD_KEYS } from './client-portal-form-trip-field-keys.constants'

/** Every form field key in the portal-form edit model. */
export const PORTAL_FORM_ALL_FIELD_KEYS = [
  ...PORTAL_FORM_PASSPORT_FIELD_KEYS,
  ...PORTAL_FORM_STRING_FIELD_KEYS,
  ...PORTAL_FORM_CONDITIONAL_FIELD_KEYS,
  ...PORTAL_FORM_TRIP_FIELD_KEYS,
] as const
