import type { KeyboardEvent, ReactElement } from 'react'
import { formatAnalyticsPercentageDisplay } from '@/entities/analytics'
import { statusLabel } from '@/entities/application'
import { StatusBadge } from '@/shared/ui'
import { ANALYTICS_COPY } from './constants'
import type { AnalyticsPerAgentStatusRowProps } from './types'

export const AnalyticsPerAgentStatusRow = ({
  row,
  onActivate,
}: AnalyticsPerAgentStatusRowProps): ReactElement => {
  const activate = (): void => {
    onActivate(row.agentId)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLLIElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activate()
    }
  }

  return (
    <li
      role="button"
      tabIndex={0}
      className="flex flex-1 flex-col justify-center cursor-pointer rounded-xl border border-line bg-white/60 px-3 py-3 text-sm transition hover:border-forest/40 hover:bg-[#f7f4ee]"
      onClick={activate}
      onKeyDown={onKeyDown}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs font-semibold text-forest">
          {row.agentId}
        </p>
        <p className="tabular-nums text-xs font-semibold text-muted">
          {ANALYTICS_COPY.perAgentTotalLabel}: {row.totalApplications}
        </p>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {row.byStatus.map((bucket) => (
          <div
            key={bucket.status}
            className="flex min-w-0 items-center justify-between gap-2"
          >
            <StatusBadge
              status={bucket.status}
              label={statusLabel(bucket.status)}
            />
            <span className="flex shrink-0 items-center gap-2 tabular-nums">
              <span className="text-xs text-muted">
                {formatAnalyticsPercentageDisplay(bucket.percentage)}
              </span>
              <span className="font-bold text-forest">{bucket.count}</span>
            </span>
          </div>
        ))}
      </div>
    </li>
  )
}
