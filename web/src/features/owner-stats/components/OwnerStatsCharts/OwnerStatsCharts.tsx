import { useEffect, useState } from 'react'
import { apiRequest } from '@/shared/api'
import {
  OWNER_STATS_COPY,
  OWNER_STATS_DEFAULT_RANGE_DAYS,
} from '../../constants'
import type { OwnerDashboardStatsOut, OwnerStatsChartsProps } from '../../types'
import {
  isCreatedByDaySeriesEmpty,
  mapAppsByStatusForChart,
  mergeCreatedByDayForChart,
} from '../../utils'
import { OwnerStatsChartsRender } from './OwnerStatsChartsRender'

type OwnerStatsChartsContainerProps = {
  rangeDays?: number
}

export const OwnerStatsCharts = ({
  rangeDays = OWNER_STATS_DEFAULT_RANGE_DAYS,
}: OwnerStatsChartsContainerProps) => {
  const [stats, setStats] = useState<OwnerDashboardStatsOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      try {
        const next = await apiRequest<OwnerDashboardStatsOut>(
          `/stats/dashboard?rangeDays=${rangeDays}`,
        )
        if (cancelled) return
        setStats(next)
        setError('')
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : OWNER_STATS_COPY.loadError
        setError(message)
        setStats(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [rangeDays])

  const statusSlices = stats ? mapAppsByStatusForChart(stats.appsByStatus) : []
  const createdPoints = stats
    ? mergeCreatedByDayForChart(stats.appsCreatedByDay, stats.usersCreatedByDay)
    : []

  const props: OwnerStatsChartsProps = {
    stats,
    loading,
    error,
  }

  return (
    <OwnerStatsChartsRender
      statusSlices={statusSlices}
      createdPoints={createdPoints}
      createdEmpty={isCreatedByDaySeriesEmpty(createdPoints)}
      rangeDays={stats?.rangeDays ?? rangeDays}
      loading={props.loading}
      error={props.error}
    />
  )
}
