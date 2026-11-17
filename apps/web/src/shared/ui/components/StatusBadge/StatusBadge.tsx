import type { ReactElement } from 'react'
import { STATUS_BADGE_CLASS } from './status-badge.constants'
import type { StatusBadgeProps } from './status-badge.types'

export const StatusBadge = ({ status, label }: StatusBadgeProps): ReactElement => {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_BADGE_CLASS[status]}`}
    >
      {label}
    </span>
  )
}
