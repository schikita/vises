import { listLegalApplicationStatusTargets } from '@/entities/application'
import type { ApplicationStatusChangeControlsProps } from '../../types'
import { ApplicationStatusChangeControlsRender } from './ApplicationStatusChangeControlsRender'

/**
 * Offers only matrix-legal targets for the current actor (FE10 / AC-9).
 * Never offers drafting→pending for staff; never calls the monitor endpoint.
 */
export const ApplicationStatusChangeControls = ({
  currentStatus,
  actor,
  pending,
  apiError,
  onChangeStatus,
}: ApplicationStatusChangeControlsProps): React.ReactElement => {
  const targets = listLegalApplicationStatusTargets(currentStatus, actor)

  return (
    <ApplicationStatusChangeControlsRender
      currentStatus={currentStatus}
      targets={targets}
      pending={pending}
      apiError={apiError}
      onChangeStatus={onChangeStatus}
    />
  )
}
