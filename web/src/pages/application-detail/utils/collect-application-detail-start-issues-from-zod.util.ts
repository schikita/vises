import type { ZodError } from 'zod'
import { mapApplicantStartFieldToSection } from '@/features/application-form'
import {
  APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS,
  APPLICATION_DETAIL_START_TRIP_FIELD_KEYS,
} from '../constants'
import type { ApplicationDetailStartIssue } from '../types'
import { buildApplicationDetailStartApplicantLabel } from './build-application-detail-start-applicant-label.util'

/**
 * Map Zod safeParse failures into Start Dialog issues (DEC-005).
 * Prefer this over `getFieldState` after `trigger` — RHF may not surface
 * nested resolver errors without a `formState` subscription.
 */
export const collectApplicationDetailStartIssuesFromZod = (
  zodError: ZodError,
  applicants: ReadonlyArray<{ firstName?: string; lastName?: string }>,
): ApplicationDetailStartIssue[] => {
  const issues: ApplicationDetailStartIssue[] = []
  const applicantFieldKeys = new Set<string>(APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS)
  const tripFieldKeys = new Set<string>(APPLICATION_DETAIL_START_TRIP_FIELD_KEYS)

  for (const issue of zodError.issues) {
    const path = issue.path
    const rootKey = path[0]

    if (typeof rootKey === 'string' && tripFieldKeys.has(rootKey)) {
      issues.push({
        message: issue.message,
        tabId: 'trip',
      })
      continue
    }

    if (path[0] === 'applicants' && typeof path[1] === 'number') {
      const index = path[1]
      const fieldKey = path[2]
      if (typeof fieldKey === 'string' && applicantFieldKeys.has(fieldKey)) {
        const identity = buildApplicationDetailStartApplicantLabel(
          applicants[index] ?? {},
          index,
        )
        issues.push({
          message: `${identity}: ${issue.message}`,
          tabId: 'applicants',
          applicantIndex: index,
          section: mapApplicantStartFieldToSection(fieldKey),
        })
      }
    }
  }

  if (issues.length > 0) {
    return issues
  }

  return zodError.issues.map((issue) => ({
    message: issue.message,
  }))
}
