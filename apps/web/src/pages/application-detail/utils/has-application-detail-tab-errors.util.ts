import { getNestedFormError } from '@/features/application-form'
import {
  APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS,
  APPLICATION_DETAIL_START_TRIP_FIELD_KEYS,
} from '../constants'
import type { ApplicationDetailTabId } from '../types'

/** Whether a detail tab should show Start-validation error chrome (DEC-005). */
export const hasApplicationDetailTabErrors = (
  errors: unknown,
  tabId: ApplicationDetailTabId,
  applicantCount: number,
): boolean => {
  if (tabId === 'trip') {
    return APPLICATION_DETAIL_START_TRIP_FIELD_KEYS.some((fieldKey) =>
      Boolean(getNestedFormError(errors, fieldKey)),
    )
  }
  if (tabId === 'applicants') {
    for (let index = 0; index < applicantCount; index += 1) {
      for (const fieldKey of APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS) {
        if (getNestedFormError(errors, `applicants.${index}.${fieldKey}`)) return true
      }
    }
    return false
  }
  return false
}
