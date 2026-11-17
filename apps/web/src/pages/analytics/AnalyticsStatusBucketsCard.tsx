import type { ReactElement } from 'react'
import { formatAnalyticsPercentageDisplay } from '@/entities/analytics'
import { statusLabel } from '@/entities/application'
import { Card, StatusBadge } from '@/shared/ui'
import { ANALYTICS_COPY } from './constants'
import type { AnalyticsStatusBucketsCardProps } from './types'

export const AnalyticsStatusBucketsCard = ({
  statusRows,
}: AnalyticsStatusBucketsCardProps): ReactElement => (
  <Card>
    <p className="font-bold">{ANALYTICS_COPY.statusTitle}</p>
    {statusRows.length === 0 ? (
      <p className="mt-4 text-sm text-muted">{ANALYTICS_COPY.statusEmpty}</p>
    ) : (
      <ul className="mt-4 space-y-2">
        {statusRows.map((row) => (
          <li
            key={row.status}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <StatusBadge status={row.status} label={statusLabel(row.status)} />
            <span className="flex items-center gap-3 tabular-nums">
              <span className="text-muted">
                {formatAnalyticsPercentageDisplay(row.percentage)}
              </span>
              <span className="font-bold text-forest">{row.count}</span>
            </span>
          </li>
        ))}
      </ul>
    )}
  </Card>
)
