import { PORTAL_FORM_TRIP_FIELD_KEYS } from '../constants'
import type {
  ClientPortalFormValues,
  PortalFormTripUpsertPatch,
} from '../types'

/**
 * Trip subsection patch for POST /apps upsert merge
 * (Location / Visa Type / Visa Sub Type / Category only — OQ-FE-002).
 */
export const toTripUpsertPatch = (
  values: ClientPortalFormValues,
): PortalFormTripUpsertPatch => {
  const patch = {} as PortalFormTripUpsertPatch
  for (const key of PORTAL_FORM_TRIP_FIELD_KEYS) {
    patch[key] = values[key].trim()
  }
  return patch
}
