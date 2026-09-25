import {
  APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS,
  APPLICATION_DETAIL_START_TRIP_FIELD_KEYS,
} from '../constants'

const tripFieldKeys = new Set<string>(APPLICATION_DETAIL_START_TRIP_FIELD_KEYS)
const applicantFieldKeys = new Set<string>(APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS)

const APPLICANT_START_PATH =
  /^applicants\.(\d+)\.([A-Za-z][A-Za-z0-9]*)$/

/** Whether an input `name` is a Start Completeness / date control (blur checklist). */
export const isApplicationDetailStartRelevantPath = (name: string): boolean => {
  if (tripFieldKeys.has(name)) {
    return true
  }
  const match = APPLICANT_START_PATH.exec(name)
  if (!match) {
    return false
  }
  return applicantFieldKeys.has(match[2] ?? '')
}
