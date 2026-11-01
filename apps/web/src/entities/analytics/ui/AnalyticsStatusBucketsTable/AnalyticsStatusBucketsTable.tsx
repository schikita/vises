import { useTranslation } from 'react-i18next'
import { Empty, StatusBadge } from '@/shared/ui'
import type { AnalyticsStatusBucketsTableProps } from '../../types'
import { formatAnalyticsPercentageDisplay } from '../../utils'

/** Status count + API percentage strings (no client recomputation). */
export const AnalyticsStatusBucketsTable = ({
  buckets,
  emptyTitle,
  emptyText,
}: AnalyticsStatusBucketsTableProps): React.ReactElement => {
  const { t } = useTranslation()

  if (buckets.length === 0) {
    return <Empty title={emptyTitle} text={emptyText} />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-surface-muted text-text-secondary">
          <tr>
            <th className="px-3 py-2 font-medium">
              {t('analytics.columns.status')}
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
          {buckets.map(
            (bucket): React.ReactElement => (
              <tr key={bucket.status} className="border-t border-border">
                <td className="px-3 py-2">
                  <StatusBadge
                    status={bucket.status}
                    label={t(`applications.status.${bucket.status}`)}
                  />
                </td>
                <td className="px-3 py-2 tabular-nums text-text-primary">
                  {bucket.count}
                </td>
                <td
                  className="px-3 py-2 font-medium tabular-nums text-text-primary"
                  data-testid={`analytics-percentage-${bucket.status}`}
                >
                  {formatAnalyticsPercentageDisplay(bucket.percentage)}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )
}
