import type { ReactElement } from 'react'
import { Card } from '@/shared/ui'
import { ANALYTICS_COPY } from './constants'
import type { AnalyticsStatsSummaryProps } from './types'

export const AnalyticsStatsSummary = ({
  appsTotal,
  agentsTotal,
}: AnalyticsStatsSummaryProps): ReactElement => (
  <div className="mt-5 grid gap-5 sm:grid-cols-2">
    <Card>
      <p className="text-sm text-muted">{ANALYTICS_COPY.appsTotalLabel}</p>
      <p className="mt-1 text-2xl font-extrabold text-forest tabular-nums">
        {appsTotal === null ? '—' : appsTotal}
      </p>
    </Card>
    <Card>
      <p className="text-sm text-muted">{ANALYTICS_COPY.agentsTotalLabel}</p>
      <p className="mt-1 text-2xl font-extrabold text-forest tabular-nums">
        {agentsTotal === null ? '—' : agentsTotal}
      </p>
    </Card>
  </div>
)
