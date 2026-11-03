import { useTranslation } from 'react-i18next'
import type { AnalyticsClientsPerAgentDto } from '@vises/contracts'
import { DataTable, type DataTableColumnDef } from '@/shared/ui'
import type { AnalyticsClientsPerAgentTableProps } from '../../types'
import { formatAnalyticsPercentageDisplay } from '../../utils'

/** Clients-per-agent counts with API percentage strings. */
export const AnalyticsClientsPerAgentTable = ({
  rows,
  emptyTitle,
  emptyText,
}: AnalyticsClientsPerAgentTableProps): React.ReactElement => {
  const { t } = useTranslation()

  const columns: DataTableColumnDef<AnalyticsClientsPerAgentDto>[] = [
    {
      id: 'agentId',
      header: t('analytics.columns.agentId'),
      cell: (row): React.ReactNode => (
        <span className="font-mono text-xs text-text-primary">{row.agentId}</span>
      ),
    },
    {
      id: 'count',
      header: t('analytics.columns.count'),
      cell: (row): React.ReactNode => (
        <span className="tabular-nums text-text-primary">{row.count}</span>
      ),
    },
    {
      id: 'percentage',
      header: t('analytics.columns.percentage'),
      cell: (row): React.ReactNode => (
        <span
          className="font-medium tabular-nums text-text-primary"
          data-testid={`analytics-clients-percentage-${row.agentId}`}
        >
          {formatAnalyticsPercentageDisplay(row.percentage)}
        </span>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(row): string => row.agentId}
      emptyTitle={emptyTitle}
      emptyText={emptyText}
    />
  )
}
