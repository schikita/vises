import type { DefaultValues } from 'react-hook-form'
import type { PortalOnePageFormValues } from './portal-one-page-form.types'

/**
 * Soft defaults for RHF before zod submit validation.
 * Allows empty enum-like fields (gender, passportType, inviting) without casts.
 */
export type PortalOnePageFormEmptyDefaults =
  DefaultValues<PortalOnePageFormValues>
