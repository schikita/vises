import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/ui'
import type { AnalyticsReportProps } from '../../types'
import { AnalyticsClientsPerAgentTable } from '../AnalyticsClientsPerAgentTable'
import { AnalyticsPerAgentList } from '../AnalyticsPerAgentList'
import { AnalyticsStatusBucketsTable } from '../AnalyticsStatusBucketsTable'

/** Full AnalyticsDto display: global, per-agent, clients-per-agent (AC-12). */
export const AnalyticsReport = ({
  data,
}: AnalyticsReportProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold text-text-primary">
            {t('analytics.global.title')}
          </h2>
          <p className="text-sm text-text-secondary">
            {t('analytics.global.totalApplications', {
              count: data.global.totalApplications,
            })}
          </p>
        </div>
        <Card className="space-y-3">
          <AnalyticsStatusBucketsTable
            buckets={data.global.byStatus}
            emptyTitle={t('analytics.empty.bucketsTitle')}
            emptyText={t('analytics.empty.bucketsText')}
          />
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-text-primary">
          {t('analytics.perAgent.title')}
        </h2>
        <AnalyticsPerAgentList
          items={data.perAgent}
          emptyTitle={t('analytics.empty.perAgentTitle')}
          emptyText={t('analytics.empty.perAgentText')}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-text-primary">
          {t('analytics.clientsPerAgent.title')}
        </h2>
        <Card className="space-y-3">
          <AnalyticsClientsPerAgentTable
            rows={data.clientsPerAgent}
            emptyTitle={t('analytics.empty.clientsTitle')}
            emptyText={t('analytics.empty.clientsText')}
          />
        </Card>
      </section>
    </div>
  )
}
