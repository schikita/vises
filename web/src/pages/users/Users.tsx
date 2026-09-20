import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/app/providers'
import { inviteUrl, staffBase } from '@/entities/session'
import type { IssuedAccess, Role, UserListItem } from '@/entities/user'
import { fetchUsersPage } from '@/entities/user'
import { CreateUserForm } from '@/features/users-admin'
import { STAFF_LIST_PAGE_SIZE, staffListPageCount } from '@/shared/lib'
import type { UsersListSortKey, UsersListSortState } from './types'
import { USERS_NO_APPS_MESSAGE } from './constants'
import { UsersRender } from './UsersRender'

export const UsersPage = () => {
  const { createUser, updateUser, reissueAccess, removeUser, session } = useStore()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [rowMessage, setRowMessage] = useState('')
  const [issued, setIssued] = useState<IssuedAccess | null>(null)
  const [copied, setCopied] = useState(false)
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [sort, setSort] = useState<UsersListSortState>({ key: 'created', dir: 'desc' })
  const [page, setPage] = useState(1)
  const [reloadNonce, setReloadNonce] = useState(0)
  const [pageItems, setPageItems] = useState<UserListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const appsBase = `${staffBase(session?.role)}/apps`

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

  const onRowActivate = (user: UserListItem) => {
    if (!user.latestAppId) {
      setRowMessage(USERS_NO_APPS_MESSAGE)
      return
    }
    setRowMessage('')
    navigate(`${appsBase}/${user.latestAppId}`)
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
      issued={issued}
      copied={copied}
      q={q}
      roleFilter={roleFilter}
      sort={sort}
      rowMessage={rowMessage}
      sessionUserId={session?.userId}
      onOpenCreate={() => {
        setError('')
        setCreateOpen(true)
      }}
      onCloseCreate={() => setCreateOpen(false)}
      onQueryChange={onQueryChange}
      onRoleFilterChange={onRoleFilterChange}
      onSortChange={onSortChange}
      onPageChange={setPage}
      onRowActivate={onRowActivate}
      onCopyLink={copyLink}
      onCopyCredentials={(issuedAccess) => {
        void navigator.clipboard.writeText(
          `Vises\nЛогин: ${issuedAccess.user.login}\nПароль: ${issuedAccess.password}\nСсылка: ${inviteUrl(issuedAccess.token)}`,
        )
      }}
      onReissue={(userId) => {
        void reissueAccess(userId).then((result) => {
          if (typeof result === 'string') setError(result)
          else {
            setError('')
            setIssued(result)
          }
        })
      }}
      onToggleActive={(userId, active) => {
        void updateUser(userId, { active: !active }).then((err) => {
          if (err) setError(err)
          else refreshList()
        })
      }}
      onRemove={(userId) => {
        void removeUser(userId).then((err) => {
          if (err) setError(err)
          else refreshList()
        })
      }}
    />
  )
}
