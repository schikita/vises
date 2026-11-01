import type {
  ApplicationStatus,
  ApplicationStatusTransitionActor,
} from '@vises/contracts'

export type ApplicationStatusChangeControlsProps = {
  currentStatus: ApplicationStatus
  actor: ApplicationStatusTransitionActor
  pending: boolean
  apiError: string
  onChangeStatus: (targetStatus: ApplicationStatus) => void
}
