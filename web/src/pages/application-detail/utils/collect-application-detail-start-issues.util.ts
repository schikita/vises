import { mapApplicantStartFieldToSection } from '@/features/application-form'
import {
  APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS,
  APPLICATION_DETAIL_START_TRIP_FIELD_KEYS,
} from '../constants'
import type { ApplicationDetailStartIssue } from '../types'
import { buildApplicationDetailStartApplicantLabel } from './build-application-detail-start-applicant-label.util'

/**
 * Walks Start Completeness (+ date) paths into a Russian aggregate list.
 * Does not recompute Core/Extended inequalities (DEC-005).
 *
 * Prefer `form.getFieldState(path).error?.message` after `trigger` so the
 * gate does not rely on an unsubscribed `formState.errors` proxy snapshot.
 */
export const collectApplicationDetailStartIssues = (
  getMessage: (path: string) => string | undefined,
  applicants: ReadonlyArray<{ firstName?: string; lastName?: string }>,
): ApplicationDetailStartIssue[] => {
  const issues: ApplicationDetailStartIssue[] = []

  for (const fieldKey of APPLICATION_DETAIL_START_TRIP_FIELD_KEYS) {
    const message = getMessage(fieldKey)
    if (!message) continue
    issues.push({
      message,
      tabId: 'trip',
    })
  }

  applicants.forEach((applicant, index) => {
    const identity = buildApplicationDetailStartApplicantLabel(applicant, index)
    for (const fieldKey of APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS) {
      const message = getMessage(`applicants.${index}.${fieldKey}`)
      if (!message) continue
      issues.push({
        message: `${identity}: ${message}`,
        tabId: 'applicants',
        applicantIndex: index,
        section: mapApplicantStartFieldToSection(fieldKey),
      })
    }
  })

  return issues
}
