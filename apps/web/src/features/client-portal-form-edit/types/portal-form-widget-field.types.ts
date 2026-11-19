import { PORTAL_FORM_DATE_FIELD_KEYS } from '../constants/portal-form-date-field-keys.constants'
import { PORTAL_FORM_PHONE_FIELD_KEYS } from '../constants/portal-form-phone-field-keys.constants'
import { PORTAL_FORM_SELECT_FIELD_KEYS } from '../constants/portal-form-select-field-keys.constants'

export type PortalFormSelectField =
  (typeof PORTAL_FORM_SELECT_FIELD_KEYS)[number]

export type PortalFormDateField = (typeof PORTAL_FORM_DATE_FIELD_KEYS)[number]

export type PortalFormPhoneField = (typeof PORTAL_FORM_PHONE_FIELD_KEYS)[number]
