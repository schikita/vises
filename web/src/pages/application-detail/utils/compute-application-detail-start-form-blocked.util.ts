import { hasApplicationDetailStartPathErrors } from './has-application-detail-start-path-errors.util'
import { isApplicationDetailApplicantsEmpty } from './is-application-detail-applicants-empty.util'

/**
 * Detail-owned Start disable signal (DEC-002 / DEC-008).
 * Empty applicants OR any Start-path error — no silent full parse on mount.
 */
export const computeApplicationDetailStartFormBlocked = (
  applicants: ReadonlyArray<unknown> | null | undefined,
  errors: unknown,
): boolean => {
  if (isApplicationDetailApplicantsEmpty(applicants)) {
    return true
  }
  return hasApplicationDetailStartPathErrors(errors, applicants?.length ?? 0)
}
