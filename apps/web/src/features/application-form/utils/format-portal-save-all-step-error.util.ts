import { PORTAL_SAVE_ALL_STEP_LABELS } from '../constants/portal-save-all-steps.constants'
import type { PortalSaveAllStep } from '../types/portal-save-all-step.types'

/** Build operator-visible per-step error; message must not contain PII values. */
export const formatPortalSaveAllStepError = (
  step: PortalSaveAllStep,
  cause: unknown,
): string => {
  const label = PORTAL_SAVE_ALL_STEP_LABELS[step]
  const detail =
    cause instanceof Error && cause.message.trim()
      ? cause.message.trim()
      : 'неизвестная ошибка'
  return `Шаг «${label}» не выполнен: ${detail}`
}
