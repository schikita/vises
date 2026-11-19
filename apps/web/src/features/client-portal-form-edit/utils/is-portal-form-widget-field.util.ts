import { PORTAL_FORM_DATE_FIELD_KEYS } from '../constants/portal-form-date-field-keys.constants'
import { PORTAL_FORM_PHONE_FIELD_KEYS } from '../constants/portal-form-phone-field-keys.constants'
import { PORTAL_FORM_SELECT_FIELD_KEYS } from '../constants/portal-form-select-field-keys.constants'
import type {
  PortalFormDateField,
  PortalFormPhoneField,
  PortalFormSelectField,
} from '../types/portal-form-widget-field.types'

export const isPortalFormSelectField = (
  field: string,
): field is PortalFormSelectField =>
  PORTAL_FORM_SELECT_FIELD_KEYS.some((key): boolean => key === field)

export const isPortalFormDateField = (
  field: string,
): field is PortalFormDateField =>
  PORTAL_FORM_DATE_FIELD_KEYS.some((key): boolean => key === field)

export const isPortalFormPhoneField = (
  field: string,
): field is PortalFormPhoneField =>
  PORTAL_FORM_PHONE_FIELD_KEYS.some((key): boolean => key === field)
