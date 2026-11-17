import type { ReactElement } from 'react'
import { Card } from '@/shared/ui'
import { OWNER_HOME_COPY } from './constants'
import type { OwnerHomeStatsSummaryProps } from './types/owner-home-stats-summary.types'

export const OwnerHomeStatsSummary = ({
  appsTotal,
  agentsTotal,
}: OwnerHomeStatsSummaryProps): ReactElement => (
  <div className="mt-5 grid gap-5 sm:grid-cols-2">
    <Card>
      <p className="text-sm text-muted">{OWNER_HOME_COPY.appsTotalLabel}</p>
      <p className="mt-1 text-2xl font-extrabold text-forest tabular-nums">
        {appsTotal === null ? '—' : appsTotal}
      </p>
    </Card>
    <Card>
      <p className="text-sm text-muted">{OWNER_HOME_COPY.agentsTotalLabel}</p>
      <p className="mt-1 text-2xl font-extrabold text-forest tabular-nums">
        {agentsTotal === null ? '—' : agentsTotal}
      </p>
    </Card>
  </div>
)
