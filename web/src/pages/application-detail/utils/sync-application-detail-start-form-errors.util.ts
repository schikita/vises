import type { FieldPath } from 'react-hook-form'
import type { Application } from '@/entities/application'
import { applicationDetailStartFormSchema } from '@/features/application-form'
import type { SyncApplicationDetailStartFormErrorsArgs } from '../types'
import { isApplicationDetailStartOwnedZodPath } from './is-application-detail-start-owned-zod-path.util'
import { listApplicationDetailStartFieldPaths } from './list-application-detail-start-field-paths.util'

/**
 * Run Start Completeness schema safeParse and sync Start-owned RHF errors (DEC-001 / DEC-006).
 * Soft detail resolver is untouched — this only setError / clearErrors Start paths.
 */
export const syncApplicationDetailStartFormErrors = ({
  values,
  setError,
  clearErrors,
}: SyncApplicationDetailStartFormErrorsArgs): boolean => {
  const applicantCount = values.applicants?.length ?? 0
  const parsed = applicationDetailStartFormSchema.safeParse(values)
  const failingPaths = new Set<string>()

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      if (!isApplicationDetailStartOwnedZodPath(issue.path)) {
        continue
      }
      const name = issue.path.join('.') as FieldPath<Application>
      failingPaths.add(name)
      setError(name, { type: 'manual', message: issue.message })
    }
  }

  for (const path of listApplicationDetailStartFieldPaths(applicantCount)) {
    if (!failingPaths.has(path)) {
      clearErrors(path)
    }
  }

  return !parsed.success
}
