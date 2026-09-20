import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/app/providers'
import type { Application } from '@/entities/application'
import { fetchVisitsPage } from '@/entities/application'
import { staffBase } from '@/entities/session'
import { STAFF_LIST_PAGE_SIZE, staffListPageCount } from '@/shared/lib'
import type { VisitsFilterMode, VisitsListSortKey, VisitsListSortState } from './types'
import { VisitsRender } from './VisitsRender'

export const Visits = () => {
  const { session } = useStore()
  const navigate = useNavigate()
  const [city, setCity] = useState('all')
  const [filterMode, setFilterMode] = useState<VisitsFilterMode>('upcoming')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<VisitsListSortState>({ key: 'date', dir: 'asc' })
  const [page, setPage] = useState(1)
  const [pageItems, setPageItems] = useState<Application[]>([])
  const [total, setTotal] = useState(0)
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const appsBase = `${staffBase(session?.role)}/apps`

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    void fetchVisitsPage({
      page,
      pageSize: STAFF_LIST_PAGE_SIZE,
      q,
      city,
      mode: filterMode,
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
        setError(err instanceof Error ? err.message : 'Не удалось загрузить визиты')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, q, city, filterMode, sort])

  const onSortChange = (key: VisitsListSortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )
    setPage(1)
  }

  return (
    <VisitsRender
      visits={pageItems}
      total={total}
      cities={cities}
      city={city}
      filterMode={filterMode}
      q={q}
      sort={sort}
      page={page}
      pageSize={STAFF_LIST_PAGE_SIZE}
      loading={loading}
      error={error}
      onCityChange={(value) => {
        setCity(value)
        setPage(1)
      }}
      onFilterModeChange={(mode) => {
        setFilterMode(mode)
        setPage(1)
      }}
      onQueryChange={(value) => {
        setQ(value)
        setPage(1)
      }}
      onSortChange={onSortChange}
      onPageChange={setPage}
      onRowActivate={(appId) => {
        navigate(`${appsBase}/${appId}`)
      }}
    />
  )
}
