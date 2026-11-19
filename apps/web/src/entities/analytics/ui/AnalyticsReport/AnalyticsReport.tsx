import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, ListPager } from '@/shared/ui'
import {
  ANALYTICS_CLIENTS_PER_AGENT_PAGE_SIZE,
  ANALYTICS_PER_AGENT_PAGE_SIZE,
} from '../../constants'
import type { AnalyticsReportProps } from '../../types'
import {
  filterAnalyticsPerAgentByQ,
  mapAnalyticsStatusBuckets,
  sliceAnalyticsClientsPage,
  sliceAnalyticsPerAgentPage,
} from '../../utils'
import { AnalyticsClientsPerAgentTable } from '../AnalyticsClientsPerAgentTable'
import { AnalyticsPerAgentList } from '../AnalyticsPerAgentList'
import { AnalyticsStatusBucketsTable } from '../AnalyticsStatusBucketsTable'

/** Full AnalyticsDto display: global, per-agent, clients-per-agent (AC-12 / FE17 / FE18). */
export const AnalyticsReport = ({
  data,
  perAgentPage,
  agentSearch,
  onPerAgentPageChange,
}: AnalyticsReportProps): React.ReactElement => {
  const { t } = useTranslation()
  const [clientsPage, setClientsPage] = useState(1)
  const clientsPageSize = ANALYTICS_CLIENTS_PER_AGENT_PAGE_SIZE
  const clientsTotal = data.clientsPerAgent.length
  const clientsPageItems = sliceAnalyticsClientsPage(
    data.clientsPerAgent,
    clientsPage,
    clientsPageSize,
  )

  const filteredPerAgent = filterAnalyticsPerAgentByQ(
    data.perAgent,
    agentSearch,
  )
  const perAgentPageSize = ANALYTICS_PER_AGENT_PAGE_SIZE
  const perAgentTotal = filteredPerAgent.length
  const perAgentItems = sliceAnalyticsPerAgentPage(
    filteredPerAgent,
    perAgentPage,
    perAgentPageSize,
  )

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
            buckets={mapAnalyticsStatusBuckets(data.global.byStatus)}
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
          items={perAgentItems}
          emptyTitle={t('analytics.empty.perAgentTitle')}
          emptyText={t('analytics.empty.perAgentText')}
        />
        <ListPager
          page={perAgentPage}
          pageSize={perAgentPageSize}
          total={perAgentTotal}
          onPageChange={onPerAgentPageChange}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-text-primary">
          {t('analytics.clientsPerAgent.title')}
        </h2>
        <Card className="space-y-3">
          <AnalyticsClientsPerAgentTable
            rows={clientsPageItems}
            emptyTitle={t('analytics.empty.clientsTitle')}
            emptyText={t('analytics.empty.clientsText')}
          />
        </Card>
        <ListPager
          page={clientsPage}
          pageSize={clientsPageSize}
          total={clientsTotal}
          onPageChange={setClientsPage}
        />
      </section>
    </div>
  )
}
