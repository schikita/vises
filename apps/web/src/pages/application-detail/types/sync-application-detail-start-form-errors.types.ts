import type {
  FieldPath,
  UseFormClearErrors,
  UseFormSetError,
} from 'react-hook-form'
import type { Application } from '@/entities/application'

/** Args for Start-schema Zod → RHF error sync (DEC-001 / DEC-006). */
export type SyncApplicationDetailStartFormErrorsArgs = {
  values: Application
  setError: UseFormSetError<Application>
  clearErrors: UseFormClearErrors<Application>
}

/** RHF path string for a Start-owned field. */
export type ApplicationDetailStartFieldPath = FieldPath<Application>
