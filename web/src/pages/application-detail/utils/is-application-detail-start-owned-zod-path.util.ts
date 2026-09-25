import {
  APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS,
  APPLICATION_DETAIL_START_TRIP_FIELD_KEYS,
} from '../constants'

const tripFieldKeys = new Set<string>(APPLICATION_DETAIL_START_TRIP_FIELD_KEYS)
const applicantFieldKeys = new Set<string>(APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS)

/** Whether a Zod issue path is a Start Completeness / date owned field (DEC-006). */
export const isApplicationDetailStartOwnedZodPath = (
  path: ReadonlyArray<PropertyKey>,
): boolean => {
  const rootKey = path[0]
  if (typeof rootKey === 'string' && tripFieldKeys.has(rootKey) && path.length === 1) {
    return true
  }
  if (path[0] !== 'applicants' || typeof path[1] !== 'number') {
    return false
  }
  const fieldKey = path[2]
  return typeof fieldKey === 'string' && applicantFieldKeys.has(fieldKey)
}
