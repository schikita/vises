import type { ApplicationStatus } from '@vises/contracts'

export type ApplicationStatusChangeControlsRenderProps = {
  currentStatus: ApplicationStatus
  targets: ApplicationStatus[]
  pending: boolean
  apiError: string
  onChangeStatus: (targetStatus: ApplicationStatus) => void
}
