import { useTranslation } from 'react-i18next'
import { Empty } from '@/shared/ui'
import type { AnalyticsClientsPerAgentTableProps } from '../../types'
import { formatAnalyticsPercentageDisplay } from '../../utils'

/** Clients-per-agent counts with API percentage strings. */
export const AnalyticsClientsPerAgentTable = ({
  rows,
  emptyTitle,
  emptyText,
}: AnalyticsClientsPerAgentTableProps): React.ReactElement => {
  const { t } = useTranslation()

  if (rows.length === 0) {
    return <Empty title={emptyTitle} text={emptyText} />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-surface-muted text-text-secondary">
          <tr>
            <th className="px-3 py-2 font-medium">
              {t('analytics.columns.agentId')}
            </th>
            <th className="px-3 py-2 font-medium">
              {t('analytics.columns.count')}
            </th>
            <th className="px-3 py-2 font-medium">
              {t('analytics.columns.percentage')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(
            (row): React.ReactElement => (
              <tr key={row.agentId} className="border-t border-border">
                <td className="px-3 py-2 font-mono text-xs text-text-primary">
                  {row.agentId}
                </td>
                <td className="px-3 py-2 tabular-nums text-text-primary">
                  {row.count}
                </td>
                <td
                  className="px-3 py-2 font-medium tabular-nums text-text-primary"
                  data-testid={`analytics-clients-percentage-${row.agentId}`}
                >
                  {formatAnalyticsPercentageDisplay(row.percentage)}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )
}
