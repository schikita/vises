import { useTranslation } from 'react-i18next'
import { Card, Empty } from '@/shared/ui'
import type { AnalyticsPerAgentListProps } from '../../types'
import { mapAnalyticsStatusBuckets } from '../../utils'
import { AnalyticsStatusBucketsTable } from '../AnalyticsStatusBucketsTable'

/** Per-agent application status breakdowns. */
export const AnalyticsPerAgentList = ({
  items,
  emptyTitle,
  emptyText,
}: AnalyticsPerAgentListProps): React.ReactElement => {
  const { t } = useTranslation()

  if (items.length === 0) {
    return <Empty title={emptyTitle} text={emptyText} />
  }

  return (
    <div className="space-y-4">
      {items.map(
        (item): React.ReactElement => (
          <Card key={item.agentId} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-text-primary">
                {t('analytics.perAgent.agentHeading', { id: item.agentId })}
              </p>
              <p className="text-sm text-text-secondary">
                {t('analytics.perAgent.totalApplications', {
                  count: item.totalApplications,
                })}
              </p>
            </div>
            <AnalyticsStatusBucketsTable
              buckets={mapAnalyticsStatusBuckets(item.byStatus)}
              emptyTitle={emptyTitle}
              emptyText={emptyText}
            />
          </Card>
        ),
      )}
    </div>
  )
}
