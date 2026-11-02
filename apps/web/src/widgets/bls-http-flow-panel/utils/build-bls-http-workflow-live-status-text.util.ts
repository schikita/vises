import { BLS_WORKFLOW_PANEL_COPY as copy } from '../constants'
import type { BlsHttpWorkflowLiveStatusParts } from '../types'

/**
 * Concise Russian announcement for aria-live during load / empty / poll (NFR-004).
 * Status + current step are the primary signals; errors and polling are included when set.
 */
export const buildBlsHttpWorkflowLiveStatusText = (
  parts: BlsHttpWorkflowLiveStatusParts,
): string => {
  if (parts.loading) return copy.loading
  if (parts.error) return parts.error

  const segments: string[] = []

  if (parts.actionError) {
    segments.push(parts.actionError)
  }

  if (parts.empty) {
    segments.push(`${copy.emptyTitle}. ${copy.emptyText}`)
    return segments.join(' ')
  }

  if (parts.statusLabel) {
    segments.push(`${copy.status}: ${parts.statusLabel}`)
    segments.push(
      `${copy.currentStep}: ${parts.currentStepLabel ?? copy.dash}`,
    )
  }

  if (parts.polling) {
    segments.push(copy.polling)
  }

  return segments.join('. ')
}
