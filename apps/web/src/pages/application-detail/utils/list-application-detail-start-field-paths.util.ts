import {
  APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS,
  APPLICATION_DETAIL_START_TRIP_FIELD_KEYS,
} from '../constants'
import type { ApplicationDetailStartFieldPath } from '../types'

/** All Start-owned RHF paths for the current applicant count (DEC-006 clear set). */
export const listApplicationDetailStartFieldPaths = (
  applicantCount: number,
): ApplicationDetailStartFieldPath[] => {
  const paths: ApplicationDetailStartFieldPath[] = [
    ...APPLICATION_DETAIL_START_TRIP_FIELD_KEYS,
  ]

  for (let index = 0; index < applicantCount; index += 1) {
    for (const fieldKey of APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS) {
      paths.push(`applicants.${index}.${fieldKey}` as ApplicationDetailStartFieldPath)
    }
  }

  return paths
}
