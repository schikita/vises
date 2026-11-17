import { useEffect, useState, type ReactElement, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '@/app/providers'
import { inviteUrl, staffBase } from '@/entities/session'
import type { IssuedAccess, Role, UserListItem } from '@/entities/user'
import { fetchUsersPage } from '@/entities/user'
import { CreateUserForm, USER_DETAIL_STATUS_ACTION_ERROR } from '@/features/users-admin'
import { STAFF_LIST_PAGE_SIZE, staffListPageCount } from '@/shared/lib'
import { USERS_PROFILE_USER_ID_QUERY } from './constants'
import type { UsersListSortKey, UsersListSortState } from './types'
import { UsersRender } from './UsersRender'

export const UsersPage = (): ReactElement => {
  const { createUser, updateUser, session } = useStore()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const profileUserId = searchParams.get(USERS_PROFILE_USER_ID_QUERY)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)
  const [issued, setIssued] = useState<IssuedAccess | null>(null)
  const [copied, setCopied] = useState(false)
  const [q, setQ] = useState(profileUserId ?? '')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [sort, setSort] = useState<UsersListSortState>({ key: 'created', dir: 'desc' })
  const [page, setPage] = useState(1)
  const [reloadNonce, setReloadNonce] = useState(0)
  const [pageItems, setPageItems] = useState<UserListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [statusBusy, setStatusBusy] = useState(false)
  const [statusError, setStatusError] = useState('')
  const appsBase = `${staffBase(session?.role)}/apps`

  useEffect(() => {
    if (!profileUserId) return
    setQ(profileUserId)
    setRoleFilter('all')
    setPage(1)
  }, [profileUserId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setListError('')
    void fetchUsersPage({
      page,
      pageSize: STAFF_LIST_PAGE_SIZE,
      q,
      role: roleFilter,
      sort: sort.key,
      sortDir: sort.dir,
    })
      .then((data) => {
        if (cancelled) return
        setPageItems(data.items)
        setTotal(data.total)
        const pageCount = staffListPageCount(data.total, data.pageSize)
        if (page > pageCount) setPage(pageCount)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setPageItems([])
        setTotal(0)
        setListError(err instanceof Error ? err.message : 'Не удалось загрузить пользователей')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, q, roleFilter, sort, reloadNonce])

  useEffect(() => {
    if (!profileUserId || loading) return
    const found = pageItems.find((user) => user.id === profileUserId) ?? null
    if (!found) return
    setSelectedUser(found)
    const next = new URLSearchParams(searchParams)
    next.delete(USERS_PROFILE_USER_ID_QUERY)
    setSearchParams(next, { replace: true })
  }, [profileUserId, loading, pageItems, searchParams, setSearchParams])

  const refreshList = () => setReloadNonce((n) => n + 1)

  const copyLink = (token: string) => {
    void navigator.clipboard.writeText(inviteUrl(token))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const onSortChange = (key: UsersListSortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )
    setPage(1)
  }

  const onQueryChange = (value: string) => {
    setQ(value)
    setPage(1)
  }

  const onRoleFilterChange = (role: Role | 'all') => {
    setRoleFilter(role)
    setPage(1)
  }

  const onSetActive = async (userId: string, active: boolean): Promise<void> => {
    setStatusBusy(true)
    setStatusError('')
    const err = await updateUser(userId, { active })
    if (err) {
      setStatusError(err || USER_DETAIL_STATUS_ACTION_ERROR)
      setStatusBusy(false)
      return
    }
    setPageItems((cur) =>
      cur.map((user) => (user.id === userId ? { ...user, active } : user)),
    )
    setSelectedUser((cur) => (cur && cur.id === userId ? { ...cur, active } : cur))
    setStatusBusy(false)
    refreshList()
  }

  const createForm: ReactNode = (
    <CreateUserForm
      apiError={error}
      onValidSubmit={async ({ name, email, login, role }) => {
        const result = await createUser({ name, email, login, role })
        if (typeof result === 'string') {
          setError(result)
          setIssued(null)
          return false
        }
        setError('')
        setIssued(result)
        setCreateOpen(false)
        setPage(1)
        refreshList()
        return true
      }}
    />
  )

  return (
    <UsersRender
      pageItems={pageItems}
      total={total}
      page={page}
      pageSize={STAFF_LIST_PAGE_SIZE}
      loading={loading}
      listError={listError}
      createForm={createForm}
      createOpen={createOpen}
      selectedUser={selectedUser}
      issued={issued}
      copied={copied}
      q={q}
      roleFilter={roleFilter}
      sort={sort}
      onOpenCreate={() => {
        setError('')
        setCreateOpen(true)
      }}
      onCloseCreate={() => setCreateOpen(false)}
      onCloseUserDetail={() => {
        setStatusError('')
        setSelectedUser(null)
      }}
      onQueryChange={onQueryChange}
      onRoleFilterChange={onRoleFilterChange}
      onSortChange={onSortChange}
      onPageChange={setPage}
      onRowActivate={(user) => {
        setStatusError('')
        setSelectedUser(user)
      }}
      onOpenLatestApp={(appId) => {
        setSelectedUser(null)
        navigate(`${appsBase}/${appId}`)
      }}
      onCopyLink={copyLink}
      onCopyCredentials={(issuedAccess) => {
        void navigator.clipboard.writeText(
          `Vises\nЛогин: ${issuedAccess.user.login}\nПароль: ${issuedAccess.password}\nСсылка: ${inviteUrl(issuedAccess.token)}`,
        )
      }}
      actorRole={session?.role}
      actorId={session?.userId}
      statusBusy={statusBusy}
      statusError={statusError}
      onSetActive={(userId, active) => {
        void onSetActive(userId, active)
      }}
    />
  )
}
