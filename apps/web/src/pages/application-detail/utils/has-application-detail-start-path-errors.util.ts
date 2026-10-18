import { getNestedFormError } from '@/features/application-form'
import { listApplicationDetailStartFieldPaths } from './list-application-detail-start-field-paths.util'

/** True when any Start-owned path has an RHF error (DEC-002 disable signal). */
export const hasApplicationDetailStartPathErrors = (
  errors: unknown,
  applicantCount: number,
): boolean =>
  listApplicationDetailStartFieldPaths(applicantCount).some((path) =>
    Boolean(getNestedFormError(errors, path)),
  )
