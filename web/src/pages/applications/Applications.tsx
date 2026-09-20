import { useEffect, useState } from 'react'
import { useStore } from '@/app/providers'
import type { Application, Status } from '@/entities/application'
import { fetchAppsPage } from '@/entities/application'
import { staffBase } from '@/entities/session'
import { STAFF_LIST_PAGE_SIZE, staffListPageCount } from '@/shared/lib'
import type { AppsListSortKey, AppsListSortState } from './types'
import { ApplicationsRender } from './ApplicationsRender'

export const Applications = () => {
  const { session } = useStore()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<Status | 'all'>('all')
  const [city, setCity] = useState('all')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<AppsListSortState>({ key: 'travelDate', dir: 'desc' })
  const [pageItems, setPageItems] = useState<Application[]>([])
  const [total, setTotal] = useState(0)
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    void fetchAppsPage({
      page,
      pageSize: STAFF_LIST_PAGE_SIZE,
      q,
      status,
      city,
      sort: sort.key,
      sortDir: sort.dir,
    })
      .then((data) => {
        if (cancelled) return
        setPageItems(data.items)
        setTotal(data.total)
        setCities(data.cities ?? [])
        const pageCount = staffListPageCount(data.total, data.pageSize)
        if (page > pageCount) setPage(pageCount)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setPageItems([])
        setTotal(0)
        setError(err instanceof Error ? err.message : 'Не удалось загрузить заявки')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, q, status, city, sort])

  const onQueryChange = (value: string) => {
    setQ(value)
    setPage(1)
  }

  const onStatusChange = (value: Status | 'all') => {
    setStatus(value)
    setPage(1)
  }

  const onCityChange = (value: string) => {
    setCity(value)
    setPage(1)
  }

  const onSortChange = (key: AppsListSortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )
    setPage(1)
  }

  return (
    <ApplicationsRender
      filteredCount={total}
      pageItems={pageItems}
      cities={cities}
      q={q}
      status={status}
      city={city}
      page={page}
      pageSize={STAFF_LIST_PAGE_SIZE}
      sort={sort}
      loading={loading}
      error={error}
      appsBase={`${staffBase(session?.role)}/apps`}
      onQueryChange={onQueryChange}
      onStatusChange={onStatusChange}
      onCityChange={onCityChange}
      onPageChange={setPage}
      onSortChange={onSortChange}
    />
  )
}
