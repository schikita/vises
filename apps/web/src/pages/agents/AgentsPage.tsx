import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  USER_QUERY_KEYS,
  fetchUsersPage,
} from '@/entities/user'
import { readListNoticeI18nKey, resolveApiErrorI18nKey } from '@/shared/api'
import { AGENTS_LIST_PAGE_SIZE } from './constants'
import { AgentsRender } from './AgentsRender'
import type { AgentsListSortKey, AgentsListSortState } from './types/agents-list-sort.types'

/** Staff agents list → per-agent balance entry (FE8 / AC-10 / FE18 / DEC-P17 / FE24). */
export const AgentsPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const location = useLocation()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<AgentsListSortState>({
    key: 'name',
    dir: 'asc',
  })
  const noticeKey = readListNoticeI18nKey(location.state)
  const notice = noticeKey ? t(noticeKey) : ''

  const listParams = useMemo(
    () => ({
      page,
      pageSize: AGENTS_LIST_PAGE_SIZE,
      q,
      role: 'agent' as const,
      sort: sort.key,
      sortDir: sort.dir,
    }),
    [page, q, sort],
  )

  const listQuery = useQuery({
    queryKey: USER_QUERY_KEYS.list(listParams),
    queryFn: (): Promise<Awaited<ReturnType<typeof fetchUsersPage>>> =>
      fetchUsersPage(listParams),
    placeholderData: keepPreviousData,
  })

  const items = listQuery.data?.items ?? []
  const total = listQuery.data?.total ?? 0
  const pageSize = listQuery.data?.pageSize ?? AGENTS_LIST_PAGE_SIZE
  const listError = listQuery.isError
    ? t(resolveApiErrorI18nKey(listQuery.error))
    : ''
  const loading = listQuery.isLoading && listQuery.data === undefined

  const onSortChange = (key: AgentsListSortKey): void => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )
    setPage(1)
  }

  return (
    <AgentsRender
      agents={items}
      loading={loading}
      listError={listError}
      notice={notice}
      empty={!loading && !listQuery.isError && items.length === 0}
      total={total}
      page={page}
      pageSize={pageSize}
      q={q}
      sort={sort}
      onQueryChange={(value): void => {
        setQ(value)
        setPage(1)
      }}
      onSortChange={onSortChange}
      onPageChange={setPage}
    />
  )
}
