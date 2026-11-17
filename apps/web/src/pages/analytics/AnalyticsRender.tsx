import type { ReactElement } from 'react'
import { ANALYTICS_COPY } from './constants'
import { AnalyticsBookedVsUnpaidCard } from './AnalyticsBookedVsUnpaidCard'
import { AnalyticsCityDistributionCard } from './AnalyticsCityDistributionCard'
import { AnalyticsClientsPerAgentCard } from './AnalyticsClientsPerAgentCard'
import { AnalyticsPerAgentStatusCard } from './AnalyticsPerAgentStatusCard'
import { AnalyticsPaymentCompletenessCard } from './AnalyticsPaymentCompletenessCard'
import { AnalyticsStatsSummary } from './AnalyticsStatsSummary'
import { AnalyticsStatusBucketsCard } from './AnalyticsStatusBucketsCard'
import type { AnalyticsRenderProps } from './types'

export const AnalyticsRender = ({
  loading,
  loadError,
  empty,
  appsTotal,
  agentsTotal,
  statusRows,
  clientsRows,
  bookedVsUnpaid,
  cityDistribution,
  paymentCompleteness,
  perAgentRows,
  filters,
  onAgentActivate,
  profileError,
}: AnalyticsRenderProps): ReactElement => (
  <div>
    <h1 className="text-2xl font-extrabold tracking-tight">
      {ANALYTICS_COPY.title}
    </h1>
    <p className="mt-1 text-sm text-muted">{ANALYTICS_COPY.subtitle}</p>

    <div className="mt-5">{filters}</div>

    {loading ? (
      <p className="mt-6 text-sm text-muted" role="status">
        {ANALYTICS_COPY.loading}
      </p>
    ) : null}

    {loadError ? (
      <p className="mt-6 text-sm font-semibold text-clay" role="alert">
        {loadError}
      </p>
    ) : null}

    {profileError ? (
      <p className="mt-4 text-sm font-semibold text-clay" role="alert">
        {profileError}
      </p>
    ) : null}

    {!loading && !loadError && empty ? (
      <div className="mt-6 py-10 text-center">
        <p className="text-base font-bold">{ANALYTICS_COPY.emptyTitle}</p>
        <p className="mt-1 text-sm text-muted">{ANALYTICS_COPY.emptyText}</p>
      </div>
    ) : null}

    {!loading && !loadError && !empty ? (
      <>
        <AnalyticsStatsSummary
          appsTotal={appsTotal}
          agentsTotal={agentsTotal}
        />
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <AnalyticsStatusBucketsCard statusRows={statusRows} />
          <div className="grid gap-5 content-start">
            {bookedVsUnpaid ? (
              <AnalyticsBookedVsUnpaidCard data={bookedVsUnpaid} />
            ) : null}
            {paymentCompleteness ? (
              <AnalyticsPaymentCompletenessCard data={paymentCompleteness} />
            ) : null}
            <AnalyticsCityDistributionCard rows={cityDistribution} />
          </div>
        </div>
        <div className="mt-5 grid items-stretch gap-5 lg:grid-cols-2">
          <AnalyticsPerAgentStatusCard
            rows={perAgentRows}
            onAgentActivate={onAgentActivate}
          />
          <AnalyticsClientsPerAgentCard
            rows={clientsRows}
            onAgentActivate={onAgentActivate}
          />
        </div>
      </>
    ) : null}
  </div>
)
