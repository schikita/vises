import type { ReactElement } from 'react'
import { formatAnalyticsPercentageDisplay } from '@/entities/analytics'
import { Card } from '@/shared/ui'
import { ANALYTICS_COPY } from './constants'
import type { AnalyticsCityDistributionCardProps } from './types'

export const AnalyticsCityDistributionCard = ({
  rows,
}: AnalyticsCityDistributionCardProps): ReactElement => (
  <Card>
    <p className="font-bold">{ANALYTICS_COPY.cityDistributionTitle}</p>
    {rows.length === 0 ? (
      <p className="mt-4 text-sm text-muted">
        {ANALYTICS_COPY.cityDistributionEmpty}
      </p>
    ) : (
      <ul className="mt-4 space-y-2">
        {rows.map((row) => (
          <li
            key={row.city}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="font-semibold text-forest">{row.city}</span>
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
