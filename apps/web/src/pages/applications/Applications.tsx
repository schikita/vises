import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ApplicationStatus } from '@vises/contracts'
import {
  APPLICATION_QUERY_KEYS,
  fetchAppsPage,
  type AppsPaginatedList,
} from '@/entities/application'
import {
  CLIENT_APPLICATION_JOIN_QUERY_KEY,
  fetchClientApplicationJoins,
} from '@/entities/client'
import { homePath, useSession } from '@/entities/session'
import { readListNoticeI18nKey, resolveApiErrorI18nKey } from '@/shared/api'
import { STAFF_LIST_PAGE_SIZE, staffListPageCount } from '@/shared/lib'
import type { AppsListSortKey, AppsListSortState } from './types'
import { mapAppToListRow, resolveApplicationsEmptyCreateCta } from './utils'
import { ApplicationsRender } from './ApplicationsRender'

/**
 * Applications list (FE10 / AC-9): AppOut list + ApplicationStatus filters,
 * join via ClientDetailDto.applicationId === AppOut.id.
 */
export const Applications = (): React.ReactElement => {
  const { t } = useTranslation()
  const { session } = useSession()
  const location = useLocation()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<ApplicationStatus | 'all'>('all')
  const [city, setCity] = useState('all')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<AppsListSortState>({
    key: 'travelDate',
    dir: 'desc',
  })

  const role = session?.role
  const appsBase = role ? `${homePath(role)}/apps` : '/app/apps'
  const clientsBase = role ? `${homePath(role)}/clients` : '/app/clients'
  const emptyCreateCta = role ? resolveApplicationsEmptyCreateCta(role) : null
  const createCtaTo = emptyCreateCta?.to ?? null
  const createCtaLabel = emptyCreateCta ? t(emptyCreateCta.labelKey) : ''
  const noticeKey = readListNoticeI18nKey(location.state)
  const notice = noticeKey ? t(noticeKey) : ''

  const listQuery = useQuery({
    queryKey: APPLICATION_QUERY_KEYS.list({
      page,
      q,
      status,
      city,
      sort: sort.key,
      sortDir: sort.dir,
    }),
    queryFn: (): Promise<AppsPaginatedList> =>
      fetchAppsPage({
        page,
        pageSize: STAFF_LIST_PAGE_SIZE,
        q,
        status,
        city,
        sort: sort.key,
        sortDir: sort.dir,
      }),
  })

  const joinQuery = useQuery({
    queryKey: CLIENT_APPLICATION_JOIN_QUERY_KEY,
    queryFn: fetchClientApplicationJoins,
  })

  useEffect((): void => {
    if (!listQuery.data) {
      return
    }
    const pageCount = staffListPageCount(
      listQuery.data.total,
      listQuery.data.pageSize,
    )
    if (page > pageCount) {
      setPage(pageCount)
    }
  }, [listQuery.data, page])

  const unnamedFallback = t('clients.list.unnamed')
  const pageItems = useMemo(() => {
    const apps = listQuery.data?.items ?? []
    const joins = joinQuery.data ?? []
    return apps.map((app) => mapAppToListRow(app, joins, unnamedFallback))
  }, [listQuery.data?.items, joinQuery.data, unnamedFallback])

  const listError =
    listQuery.isError || joinQuery.isError
      ? t(
          resolveApiErrorI18nKey(
            listQuery.error ?? joinQuery.error ?? new Error('load failed'),
          ),
        )
      : ''

  const onQueryChange = (value: string): void => {
    setQ(value)
    setPage(1)
  }

  const onStatusChange = (value: ApplicationStatus | 'all'): void => {
    setStatus(value)
    setPage(1)
  }

  const onCityChange = (value: string): void => {
    setCity(value)
    setPage(1)
  }

  const onSortChange = (key: AppsListSortKey): void => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )
    setPage(1)
  }

  return (
    <ApplicationsRender
      filteredCount={listQuery.data?.total ?? 0}
      pageItems={pageItems}
      cities={listQuery.data?.cities ?? []}
      q={q}
      status={status}
      city={city}
      page={page}
      pageSize={STAFF_LIST_PAGE_SIZE}
      sort={sort}
      loading={listQuery.isLoading || joinQuery.isLoading}
      error={listError}
      notice={notice}
      appsBase={appsBase}
      clientsBase={clientsBase}
      createCtaTo={createCtaTo}
      createCtaLabel={createCtaLabel}
      onQueryChange={onQueryChange}
      onStatusChange={onStatusChange}
      onCityChange={onCityChange}
      onPageChange={setPage}
      onSortChange={onSortChange}
    />
  )
}
