import type { ReactElement } from 'react'
import { Card } from '@/shared/ui'
import { ANALYTICS_COPY } from './constants'
import type { AnalyticsBookedVsUnpaidCardProps } from './types'

export const AnalyticsBookedVsUnpaidCard = ({
  data,
}: AnalyticsBookedVsUnpaidCardProps): ReactElement => (
  <Card>
    <p className="font-bold">{ANALYTICS_COPY.bookedVsUnpaidTitle}</p>
    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
      <div>
        <dt className="text-sm text-muted">
          {ANALYTICS_COPY.bookedVsUnpaidBookedLabel}
        </dt>
        <dd className="mt-1 text-2xl font-extrabold text-forest tabular-nums">
          {data.bookedCount}
        </dd>
      </div>
      <div>
        <dt className="text-sm text-muted">
          {ANALYTICS_COPY.bookedVsUnpaidUnpaidLabel}
        </dt>
        <dd className="mt-1 text-2xl font-extrabold text-clay tabular-nums">
          {data.unpaidCount}
        </dd>
      </div>
    </dl>
  </Card>
)
