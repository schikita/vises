import { getNestedFormError } from '@/features/application-form'
import { APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS } from '../constants'

/** True when any Start Completeness (+ date) field under `applicants.{index}` has an RHF error. */
export const hasApplicationDetailApplicantErrors = (
  errors: unknown,
  applicantIndex: number,
): boolean =>
  APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS.some((fieldKey) =>
    Boolean(getNestedFormError(errors, `applicants.${applicantIndex}.${fieldKey}`)),
  )
