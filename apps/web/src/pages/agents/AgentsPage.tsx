import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  USER_QUERY_KEYS,
  fetchUsersPage,
} from '@/entities/user'
import { readListNoticeI18nKey, resolveApiErrorI18nKey } from '@/shared/api'
import { STAFF_LIST_PAGE_SIZE } from '@/shared/lib'
import { AgentsRender } from './AgentsRender'

/** Staff agents list → per-agent balance entry (FE8 / AC-10). */
export const AgentsPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const location = useLocation()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const noticeKey = readListNoticeI18nKey(location.state)
  const notice = noticeKey ? t(noticeKey) : ''

  const listParams = useMemo(
    () => ({
      page,
      pageSize: STAFF_LIST_PAGE_SIZE,
      q,
      role: 'agent' as const,
      sort: 'created' as const,
      sortDir: 'desc' as const,
    }),
    [page, q],
  )

  const listQuery = useQuery({
    queryKey: USER_QUERY_KEYS.list(listParams),
    queryFn: (): Promise<Awaited<ReturnType<typeof fetchUsersPage>>> =>
      fetchUsersPage(listParams),
  })

  const items = listQuery.data?.items ?? []
  const total = listQuery.data?.total ?? 0
  const pageSize = listQuery.data?.pageSize ?? STAFF_LIST_PAGE_SIZE
  const listError = listQuery.isError
    ? t(resolveApiErrorI18nKey(listQuery.error))
    : ''

  return (
    <AgentsRender
      agents={items}
      loading={listQuery.isLoading}
      listError={listError}
      notice={notice}
      empty={!listQuery.isLoading && !listQuery.isError && items.length === 0}
      total={total}
      page={page}
      pageSize={pageSize}
      q={q}
      onQueryChange={(value): void => {
        setQ(value)
        setPage(1)
      }}
      onPageChange={setPage}
    />
  )
}
