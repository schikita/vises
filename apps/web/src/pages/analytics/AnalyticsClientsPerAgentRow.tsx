import type { ReactElement, KeyboardEvent } from 'react'
import {
  ANALYTICS_COPY,
  ANALYTICS_METRIC_LABEL_CLASS,
} from './constants'
import type { AnalyticsClientsPerAgentRowProps } from './types'
import { formatAnalyticsMoney } from './utils'

export const AnalyticsClientsPerAgentRow = ({
  row,
  onActivate,
}: AnalyticsClientsPerAgentRowProps): ReactElement => {
  const activate = (): void => {
    onActivate(row.agentId)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLLIElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activate()
    }
  }

  const metrics = [
    {
      key: 'balance',
      label: ANALYTICS_COPY.agentsBalanceLabel,
      value: formatAnalyticsMoney(row.balance),
      valueClassName: 'font-bold text-forest',
    },
    {
      key: 'registered',
      label: ANALYTICS_COPY.agentsRegisteredLabel,
      value: String(row.registered),
      valueClassName: 'font-bold text-forest',
    },
    {
      key: 'paid',
      label: ANALYTICS_COPY.agentsPaidLabel,
      value: String(row.paid),
      valueClassName: 'font-bold text-forest',
    },
    {
      key: 'paidAmount',
      label: ANALYTICS_COPY.agentsPaidAmountLabel,
      value: formatAnalyticsMoney(row.paidAmount),
      valueClassName: 'font-bold text-leaf',
    },
  ] as const

  return (
    <li
      role="button"
      tabIndex={0}
      className="flex flex-1 flex-col justify-center cursor-pointer rounded-xl border border-line bg-white/60 px-3 py-3 text-sm transition hover:border-forest/40 hover:bg-[#f7f4ee]"
      onClick={activate}
      onKeyDown={onKeyDown}
    >
      <p className="font-mono text-xs font-semibold text-forest">{row.agentId}</p>
      <ul className="mt-2 space-y-1.5">
        {metrics.map((metric) => (
          <li
            key={metric.key}
            className="flex items-center justify-between gap-2"
          >
            <span className={ANALYTICS_METRIC_LABEL_CLASS}>{metric.label}</span>
            <span className={`tabular-nums ${metric.valueClassName}`}>
              {metric.value}
            </span>
          </li>
        ))}
      </ul>
    </li>
  )
}
