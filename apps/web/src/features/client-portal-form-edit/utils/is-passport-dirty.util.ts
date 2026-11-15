import { PORTAL_FORM_PASSPORT_FIELD_KEYS } from '../constants'
import type { ClientPortalFormValues } from '../types'

/** True when any FR-6 passport field differs from the load baseline. */
export const isPassportDirty = (
  values: ClientPortalFormValues,
  baseline: ClientPortalFormValues,
): boolean => {
  for (const key of PORTAL_FORM_PASSPORT_FIELD_KEYS) {
    if (values[key].trim() !== baseline[key].trim()) {
      return true
    }
  }
  return false
}
