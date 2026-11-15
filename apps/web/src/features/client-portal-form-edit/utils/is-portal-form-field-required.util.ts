import { PORTAL_FORM_HAPPY_PATH_REQUIRED_FIELD_KEYS } from '../constants'
import type { PortalFormField } from '../types'

const REQUIRED_SET = new Set<string>(PORTAL_FORM_HAPPY_PATH_REQUIRED_FIELD_KEYS)

export const isPortalFormFieldRequired = (field: PortalFormField): boolean =>
  REQUIRED_SET.has(field)
