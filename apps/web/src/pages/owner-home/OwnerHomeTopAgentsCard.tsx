import type { ReactElement } from 'react'
import { Card } from '@/shared/ui'
import { OWNER_HOME_COPY } from './constants'
import type { OwnerHomeTopAgentsCardProps } from './types/owner-home-top-agents-card.types'
import { formatOwnerHomeBalance } from './utils'

export const OwnerHomeTopAgentsCard = ({
  rows,
}: OwnerHomeTopAgentsCardProps): ReactElement => (
  <Card>
    <p className="font-bold">{OWNER_HOME_COPY.topAgentsTitle}</p>
    {rows.length === 0 ? (
      <p className="mt-4 text-sm text-muted">{OWNER_HOME_COPY.topAgentsEmpty}</p>
    ) : (
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.agentId} className="space-y-1 text-sm">
            <span className="font-mono text-xs font-semibold text-forest">
              {row.agentId}
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums text-muted">
              <span>
                {OWNER_HOME_COPY.topAgentsBalanceLabel}:{' '}
                <span className="font-semibold text-forest">
                  {formatOwnerHomeBalance(row.balance)}
                </span>
              </span>
              <span>
                {OWNER_HOME_COPY.topAgentsRegisteredLabel}:{' '}
                <span className="font-semibold text-forest">
                  {row.registered}
                </span>
              </span>
              <span>
                {OWNER_HOME_COPY.topAgentsPaidLabel}:{' '}
                <span className="font-semibold text-forest">{row.paid}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    )}
  </Card>
)
