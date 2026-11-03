import { useTranslation } from 'react-i18next'
import type { AnalyticsStatusBucketDto } from '@vises/contracts'
import { DataTable, StatusBadge, type DataTableColumnDef } from '@/shared/ui'
import type { AnalyticsStatusBucketsTableProps } from '../../types'
import { formatAnalyticsPercentageDisplay } from '../../utils'

/** Status count + API percentage strings (no client recomputation). */
export const AnalyticsStatusBucketsTable = ({
  buckets,
  emptyTitle,
  emptyText,
}: AnalyticsStatusBucketsTableProps): React.ReactElement => {
  const { t } = useTranslation()

  const columns: DataTableColumnDef<AnalyticsStatusBucketDto>[] = [
    {
      id: 'status',
      header: t('analytics.columns.status'),
      cell: (bucket): React.ReactNode => (
        <StatusBadge
          status={bucket.status}
          label={t(`applications.status.${bucket.status}`)}
        />
      ),
    },
    {
      id: 'count',
      header: t('analytics.columns.count'),
      cell: (bucket): React.ReactNode => (
        <span className="tabular-nums text-text-primary">{bucket.count}</span>
      ),
    },
    {
      id: 'percentage',
      header: t('analytics.columns.percentage'),
      cell: (bucket): React.ReactNode => (
        <span
          className="font-medium tabular-nums text-text-primary"
          data-testid={`analytics-percentage-${bucket.status}`}
        >
          {formatAnalyticsPercentageDisplay(bucket.percentage)}
        </span>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={buckets}
      getRowId={(row): string => row.status}
      emptyTitle={emptyTitle}
      emptyText={emptyText}
    />
  )
}
