import { useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { AnalyticsDto } from '@vises/contracts'
import {
  ANALYTICS_QUERY_KEYS,
  AnalyticsReport,
  fetchRolesApplicationsAnalytics,
  isAnalyticsDtoEmpty,
} from '@/entities/analytics'
import {
  ANALYTICS_RANGE_MODE,
  AnalyticsDateRangeFilters,
  type AnalyticsRangeMode,
} from '@/features/analytics-filters'
import { resolveApiErrorI18nKey } from '@/shared/api'
import { AnalyticsRender } from './AnalyticsRender'
import { resolveAnalyticsQueryParams } from './utils'

/**
 * Admin `/admin` and agent `/app` analytics (FE11 / AC-12 / AC-12a).
 * Backend scopes agents to self; staff see global aggregates.
 */
export const AnalyticsPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const [mode, setMode] = useState<AnalyticsRangeMode>(
    ANALYTICS_RANGE_MODE.Current,
  )
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const queryParams = useMemo(
    () => resolveAnalyticsQueryParams(mode, from, to),
    [mode, from, to],
  )

  const analyticsQuery = useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.rolesApplications(queryParams),
    queryFn: (): Promise<AnalyticsDto> =>
      fetchRolesApplicationsAnalytics(queryParams),
  })

  const loadError = analyticsQuery.isError
    ? t(resolveApiErrorI18nKey(analyticsQuery.error))
    : ''

  const successData =
    analyticsQuery.isSuccess && !isAnalyticsDtoEmpty(analyticsQuery.data)
      ? analyticsQuery.data
      : null

  const filters: ReactNode = (
    <AnalyticsDateRangeFilters
      mode={mode}
      from={from}
      to={to}
      onModeChange={setMode}
      onFromChange={setFrom}
      onToChange={setTo}
    />
  )

  const report: ReactNode =
    successData !== null ? <AnalyticsReport data={successData} /> : null

  return (
    <AnalyticsRender
      loading={analyticsQuery.isLoading}
      loadError={loadError}
      data={
        analyticsQuery.isSuccess && isAnalyticsDtoEmpty(analyticsQuery.data)
          ? null
          : successData
      }
      filters={filters}
      report={report}
    />
  )
}
