import { useState, type ReactNode } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { AnalyticsDto } from '@vises/contracts'
import {
  ANALYTICS_QUERY_KEYS,
  AnalyticsReport,
  fetchRolesApplicationsAnalytics,
  isAnalyticsDtoEmpty,
  type AnalyticsQuery,
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
 * Admin `/admin` and agent `/app` analytics (FE11 / FE17 / FE18).
 * Date range drafts require Apply before refetch; perAgent search/pager are client-side.
 */
export const AnalyticsPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const [draftMode, setDraftMode] = useState<AnalyticsRangeMode>(
    ANALYTICS_RANGE_MODE.Current,
  )
  const [draftFrom, setDraftFrom] = useState('')
  const [draftTo, setDraftTo] = useState('')
  const [appliedRange, setAppliedRange] = useState<AnalyticsQuery>({})
  const [perAgentPage, setPerAgentPage] = useState(1)
  const [agentSearch, setAgentSearch] = useState('')

  const analyticsQuery = useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.rolesApplications(appliedRange),
    queryFn: (): Promise<AnalyticsDto> =>
      fetchRolesApplicationsAnalytics(appliedRange),
    placeholderData: keepPreviousData,
  })

  const loadError = analyticsQuery.isError
    ? t(resolveApiErrorI18nKey(analyticsQuery.error))
    : ''

  const successData =
    analyticsQuery.isSuccess && !isAnalyticsDtoEmpty(analyticsQuery.data)
      ? analyticsQuery.data
      : null

  const applyDraftRange = (): void => {
    setAppliedRange(
      resolveAnalyticsQueryParams(draftMode, draftFrom, draftTo),
    )
    setPerAgentPage(1)
  }

  const filters: ReactNode = (
    <AnalyticsDateRangeFilters
      mode={draftMode}
      from={draftFrom}
      to={draftTo}
      onModeChange={(mode): void => {
        setDraftMode(mode)
        if (mode === ANALYTICS_RANGE_MODE.Current) {
          setAppliedRange({})
          setPerAgentPage(1)
        }
      }}
      onFromChange={setDraftFrom}
      onToChange={setDraftTo}
      onApply={applyDraftRange}
    />
  )

  const reportKey = `${appliedRange.from ?? ''}|${appliedRange.to ?? ''}|${agentSearch.trim()}`

  const report: ReactNode =
    successData !== null ? (
      <AnalyticsReport
        key={reportKey}
        data={successData}
        perAgentPage={perAgentPage}
        agentSearch={agentSearch}
        onPerAgentPageChange={setPerAgentPage}
      />
    ) : null

  return (
    <AnalyticsRender
      loading={analyticsQuery.isLoading && analyticsQuery.data === undefined}
      loadError={loadError}
      data={
        analyticsQuery.isSuccess && isAnalyticsDtoEmpty(analyticsQuery.data)
          ? null
          : successData
      }
      filters={filters}
      report={report}
      agentSearch={agentSearch}
      onAgentSearchChange={(value): void => {
        setAgentSearch(value)
        setPerAgentPage(1)
      }}
    />
  )
}
