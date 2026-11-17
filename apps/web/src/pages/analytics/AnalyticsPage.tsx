import { useEffect, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AnalyticsDto } from '@vises/contracts'
import {
  countAnalyticsAgents,
  fetchRolesApplicationsAnalytics,
  isAnalyticsDtoEmpty,
  type AnalyticsQuery,
} from '@/entities/analytics'
import { useStore } from '@/app/providers'
import { staffBase } from '@/entities/session'
import {
  fetchUserListItemById,
  type UserListItem,
} from '@/entities/user'
import {
  USER_DETAIL_LOAD_ERROR,
  UserDetailDialog,
} from '@/features/users-admin'
import { AnalyticsFiltersCard } from './AnalyticsFiltersCard'
import { AnalyticsRender } from './AnalyticsRender'
import { ANALYTICS_COPY, ANALYTICS_RANGE_MODE } from './constants'
import type { AnalyticsRangeMode } from './types'
import { mapAnalyticsStatusRows, resolveAnalyticsQueryParams } from './utils'

/**
 * Admin Analytics page (FR-6 / FR-7 / FR-10 / ASAU-011 / ASAU-TASK-006).
 * Date-range drafts require Apply; Current mode refetches totals immediately.
 */
export const AnalyticsPage = (): ReactElement => {
  const navigate = useNavigate()
  const { session } = useStore()
  const appsBase = `${staffBase(session?.role)}/apps`
  const [draftMode, setDraftMode] = useState<AnalyticsRangeMode>(
    ANALYTICS_RANGE_MODE.Current,
  )
  const [draftFrom, setDraftFrom] = useState('')
  const [draftTo, setDraftTo] = useState('')
  const [appliedQuery, setAppliedQuery] = useState<AnalyticsQuery>({})
  const [data, setData] = useState<AnalyticsDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<UserListItem | null>(null)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError('')

    void fetchRolesApplicationsAnalytics(appliedQuery)
      .then((result): void => {
        if (cancelled) {
          return
        }
        setData(result)
        setLoading(false)
      })
      .catch((): void => {
        if (cancelled) {
          return
        }
        setData(null)
        setLoadError(ANALYTICS_COPY.loadError)
        setLoading(false)
      })

    return (): void => {
      cancelled = true
    }
  }, [appliedQuery])

  const applyDraftRange = (): void => {
    setAppliedQuery(
      resolveAnalyticsQueryParams(draftMode, draftFrom, draftTo),
    )
  }

  const handleModeChange = (mode: AnalyticsRangeMode): void => {
    setDraftMode(mode)
    if (mode === ANALYTICS_RANGE_MODE.Current) {
      setAppliedQuery({})
    }
  }

  const onAgentActivate = (agentId: string): void => {
    setProfileError('')
    void fetchUserListItemById(agentId)
      .then((user) => {
        if (!user) {
          setSelectedAgent(null)
          setProfileError(USER_DETAIL_LOAD_ERROR)
          return
        }
        setSelectedAgent(user)
      })
      .catch(() => {
        setSelectedAgent(null)
        setProfileError(USER_DETAIL_LOAD_ERROR)
      })
  }

  const empty = data !== null && isAnalyticsDtoEmpty(data)
  const successData = data !== null && !empty ? data : null

  return (
    <>
      <AnalyticsRender
        loading={loading}
        loadError={loadError}
        empty={!loading && !loadError && empty}
        appsTotal={successData ? successData.global.totalApplications : null}
        agentsTotal={successData ? countAnalyticsAgents(successData) : null}
        statusRows={mapAnalyticsStatusRows(successData)}
        clientsRows={successData ? successData.clientsPerAgent : []}
        bookedVsUnpaid={successData ? successData.bookedVsUnpaid : null}
        cityDistribution={successData ? successData.cityDistribution : []}
        paymentCompleteness={
          successData ? successData.paymentCompleteness : null
        }
        perAgentRows={successData ? successData.perAgent : []}
        onAgentActivate={onAgentActivate}
        profileError={profileError}
        filters={
          <AnalyticsFiltersCard
            mode={draftMode}
            from={draftFrom}
            to={draftTo}
            onModeChange={handleModeChange}
            onFromChange={setDraftFrom}
            onToChange={setDraftTo}
            onApply={applyDraftRange}
          />
        }
      />
      <UserDetailDialog
        user={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        onOpenLatestApp={(appId) => {
          setSelectedAgent(null)
          navigate(`${appsBase}/${appId}`)
        }}
      />
    </>
  )
}
