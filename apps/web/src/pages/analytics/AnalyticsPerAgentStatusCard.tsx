import { useState, type ReactElement } from 'react'
import { ListPager, Card } from '@/shared/ui'
import { AnalyticsPerAgentStatusRow } from './AnalyticsPerAgentStatusRow'
import { ANALYTICS_AGENTS_PAGE_SIZE, ANALYTICS_COPY } from './constants'
import type { AnalyticsPerAgentStatusCardProps } from './types'
import { sliceAnalyticsAgentsPage } from './utils'

export const AnalyticsPerAgentStatusCard = ({
  rows,
  onAgentActivate,
}: AnalyticsPerAgentStatusCardProps): ReactElement => {
  const [page, setPage] = useState(1)
  const [rowsSnapshot, setRowsSnapshot] = useState(rows)

  if (rows !== rowsSnapshot) {
    setRowsSnapshot(rows)
    setPage(1)
  }

  const pageRows = sliceAnalyticsAgentsPage(
    rows,
    page,
    ANALYTICS_AGENTS_PAGE_SIZE,
  )

  return (
    <Card className="flex h-full flex-col">
      <p className="font-bold">{ANALYTICS_COPY.perAgentStatusTitle}</p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          {ANALYTICS_COPY.perAgentStatusEmpty}
        </p>
      ) : (
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-3">
            {pageRows.map((row) => (
              <AnalyticsPerAgentStatusRow
                key={row.agentId}
                row={row}
                onActivate={onAgentActivate}
              />
            ))}
          </ul>
          <ListPager
            page={page}
            pageSize={ANALYTICS_AGENTS_PAGE_SIZE}
            total={rows.length}
            onPageChange={setPage}
          />
        </div>
      )}
    </Card>
  )
}
