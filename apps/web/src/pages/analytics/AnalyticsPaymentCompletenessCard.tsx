import type { ReactElement } from 'react'
import { formatAnalyticsPercentageDisplay } from '@/entities/analytics'
import { Card } from '@/shared/ui'
import { ANALYTICS_COPY } from './constants'
import type { AnalyticsPaymentCompletenessCardProps } from './types'

export const AnalyticsPaymentCompletenessCard = ({
  data,
}: AnalyticsPaymentCompletenessCardProps): ReactElement => (
  <Card>
    <p className="font-bold">{ANALYTICS_COPY.paymentCompletenessTitle}</p>
    <dl className="mt-4 grid gap-3 sm:grid-cols-3">
      <div>
        <dt className="text-sm text-muted">
          {ANALYTICS_COPY.paymentCompletenessTotalLabel}
        </dt>
        <dd className="mt-1 text-xl font-extrabold text-forest tabular-nums">
          {data.totalApplications}
        </dd>
      </div>
      <div>
        <dt className="text-sm text-muted">
          {ANALYTICS_COPY.paymentCompletenessPaidLabel}
        </dt>
        <dd className="mt-1 text-xl font-extrabold text-forest tabular-nums">
          {data.paidCount}
        </dd>
      </div>
      <div>
        <dt className="text-sm text-muted">
          {ANALYTICS_COPY.paymentCompletenessRateLabel}
        </dt>
        <dd className="mt-1 text-xl font-extrabold text-leaf tabular-nums">
          {formatAnalyticsPercentageDisplay(data.completenessPercentage)}
        </dd>
      </div>
    </dl>
  </Card>
)
