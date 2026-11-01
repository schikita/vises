import {
  APPLICATION_STATUS_TRANSITION_MATRIX,
  type ApplicationStatus,
  type ApplicationStatusTransitionActor,
} from '@vises/contracts'

/**
 * Matrix-legal targets for the current status + actor (FR-6 / AC-9).
 * Never includes drafting→pending for staff (monitor-only actors).
 */
export const listLegalApplicationStatusTargets = (
  source: ApplicationStatus,
  actor: ApplicationStatusTransitionActor,
): ApplicationStatus[] => {
  const targets: ApplicationStatus[] = []
  for (const row of APPLICATION_STATUS_TRANSITION_MATRIX) {
    if (row.source !== source) {
      continue
    }
    if (!(row.actors as readonly string[]).includes(actor)) {
      continue
    }
    targets.push(row.target)
  }
  return targets
}
