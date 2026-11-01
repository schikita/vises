import {
  STATUS_BADGE_BASE_CLASS,
  STATUS_BADGE_TONE_CLASS,
} from './status-badge.constants'
import { resolveStatusBadgeTone } from './resolve-status-badge-tone.util'
import type { StatusBadgeProps } from './status-badge.types'

export const StatusBadge = (props: StatusBadgeProps): React.ReactElement => {
  const { status, label } = props
  const tone = resolveStatusBadgeTone(status)
  return (
    <span className={`${STATUS_BADGE_BASE_CLASS} ${STATUS_BADGE_TONE_CLASS[tone]}`}>
      {label}
    </span>
  )
}
