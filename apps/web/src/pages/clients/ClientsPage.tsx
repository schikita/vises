import { useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ClientDto, ClientListDto } from '@vises/contracts'
import {
  CLIENT_QUERY_KEYS,
  fetchClientsList,
  filterClientsList,
  postClientCreate,
  sliceClientsListPage,
  sortClientsList,
  type ClientsListSortBy,
  type ClientsListSortDir,
} from '@/entities/client'
import { homePath, useSession } from '@/entities/session'
import {
  ClientCreateForm,
  toClientCreateBody,
} from '@/features/client-create'
import { PricePerClientHint } from '@/features/settings-price-edit'
import { readListNoticeI18nKey, resolveApiErrorI18nKey } from '@/shared/api'
import { STAFF_LIST_PAGE_SIZE } from '@/shared/lib'
import { ClientsRender } from './ClientsRender'

/**
 * Clients list: SoT returns full array; search/sort/page are client-side.
 */
export const ClientsPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const { session } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<ClientsListSortBy>('createdAt')
  const [sortDir, setSortDir] = useState<ClientsListSortDir>('desc')
  const [page, setPage] = useState(1)

  const role = session?.role
  const canCreate = role === 'agent'
  const showAgentColumn = role === 'admin' || role === 'superadmin'
  const detailBasePath = role ? `${homePath(role)}/clients` : '/app/clients'
  const noticeKey = readListNoticeI18nKey(location.state)
  const notice = noticeKey ? t(noticeKey) : ''

  const listQuery = useQuery({
    queryKey: CLIENT_QUERY_KEYS.list(),
    queryFn: (): Promise<ClientListDto[]> => fetchClientsList(),
  })

  const createMutation = useMutation({
    mutationFn: postClientCreate,
    onSuccess: async (created: ClientDto): Promise<void> => {
      setCreateError('')
      setCreateOpen(false)
      await queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all })
      navigate(`${detailBasePath}/${created.id}`)
    },
    onError: (err: unknown): void => {
      setCreateError(t(resolveApiErrorI18nKey(err)))
    },
  })

  const filteredSorted = useMemo((): ClientListDto[] => {
    const rows = listQuery.data ?? []
    return sortClientsList(filterClientsList(rows, search), sortBy, sortDir)
  }, [listQuery.data, search, sortBy, sortDir])

  const total = filteredSorted.length
  const pageSize = STAFF_LIST_PAGE_SIZE
  const items = sliceClientsListPage(filteredSorted, page, pageSize)
  const listError = listQuery.isError
    ? t(resolveApiErrorI18nKey(listQuery.error))
    : ''

  const onSortChange = (key: ClientsListSortBy): void => {
    if (sortBy === key) {
      setSortDir((prev): ClientsListSortDir => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const createForm: ReactNode = (
    <ClientCreateForm
      apiError={createError}
      pending={createMutation.isPending}
      priceHint={<PricePerClientHint className="text-sm text-text-secondary" />}
      onValidSubmit={async (values): Promise<boolean> => {
        setCreateError('')
        try {
          await createMutation.mutateAsync(toClientCreateBody(values))
          return true
        } catch {
          return false
        }
      }}
    />
  )

  return (
    <ClientsRender
      items={items}
      loading={listQuery.isLoading}
      listError={listError}
      notice={notice}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      sortBy={sortBy}
      sortDir={sortDir}
      showAgentColumn={showAgentColumn}
      canCreate={canCreate}
      createOpen={createOpen}
      createForm={createForm}
      onOpenCreate={(): void => {
        setCreateError('')
        setCreateOpen(true)
      }}
      onCloseCreate={(): void => setCreateOpen(false)}
      onSearchChange={(value): void => {
        setSearch(value)
        setPage(1)
      }}
      onSortChange={onSortChange}
      onPageChange={setPage}
      onRowActivate={(clientId): void => {
        navigate(`${detailBasePath}/${clientId}`)
      }}
    />
  )
}
