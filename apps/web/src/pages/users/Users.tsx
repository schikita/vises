import { useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { staffBase, useSession } from '@/entities/session'
import type { IssuedAccess, Role, UserListItem } from '@/entities/user'
import {
  USER_QUERY_KEYS,
  canMutateUser,
  createUser,
  deleteUser,
  fetchUsersPage,
  patchUser,
  reissueUser,
} from '@/entities/user'
import {
  CreateUserForm,
  resolveCreateUserAllowedRoles,
} from '@/features/users-admin'
import { resolveApiErrorI18nKey } from '@/shared/api'
import { STAFF_LIST_PAGE_SIZE } from '@/shared/lib'
import type {
  UsersConfirmAction,
  UsersListSortKey,
  UsersListSortState,
  UsersRoleFilter,
} from './types'
import { UsersRender } from './UsersRender'

export const UsersPage = (): React.ReactElement => {
  const { session } = useSession()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [actionError, setActionError] = useState('')
  const [rowMessage, setRowMessage] = useState('')
  const [issued, setIssued] = useState<IssuedAccess | null>(null)
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState<UsersRoleFilter>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState('')
  const [sort, setSort] = useState<UsersListSortState>({ key: 'created', dir: 'desc' })
  const [page, setPage] = useState(1)
  const [confirmAction, setConfirmAction] = useState<UsersConfirmAction | null>(null)

  const actorRole = session?.role ?? 'admin'
  const allowedCreateRoles = useMemo(
    () => resolveCreateUserAllowedRoles(actorRole),
    [actorRole],
  )
  const appsBase = `${staffBase(session?.role)}/apps`

  const listParams = useMemo(
    () => ({
      page,
      pageSize: STAFF_LIST_PAGE_SIZE,
      q,
      role: roleFilter,
      sort: sort.key,
      sortDir: sort.dir,
    }),
    [page, q, roleFilter, sort],
  )

  const listQuery = useQuery({
    queryKey: USER_QUERY_KEYS.list(listParams),
    queryFn: (): Promise<Awaited<ReturnType<typeof fetchUsersPage>>> =>
      fetchUsersPage(listParams),
  })

  const invalidateUsers = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all })

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async (data): Promise<void> => {
      setIssued(data)
      setCreateError('')
      setActionError('')
      setCreateOpen(false)
      setPage(1)
      await invalidateUsers()
    },
    onError: (err: unknown): void => {
      setCreateError(t(resolveApiErrorI18nKey(err)))
    },
  })

  const patchMutation = useMutation({
    mutationFn: (input: { userId: string; active: boolean }): Promise<unknown> =>
      patchUser(input.userId, { active: input.active }),
    onSuccess: async (): Promise<void> => {
      setActionError('')
      setConfirmAction(null)
      await invalidateUsers()
    },
    onError: (err: unknown): void => {
      setActionError(t(resolveApiErrorI18nKey(err)))
    },
  })

  const reissueMutation = useMutation({
    mutationFn: reissueUser,
    onSuccess: (data): void => {
      setIssued(data)
      setActionError('')
      setConfirmAction(null)
    },
    onError: (err: unknown): void => {
      setActionError(t(resolveApiErrorI18nKey(err)))
    },
  })

  const removeMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async (): Promise<void> => {
      setActionError('')
      setConfirmAction(null)
      await invalidateUsers()
    },
    onError: (err: unknown): void => {
      setActionError(t(resolveApiErrorI18nKey(err)))
    },
  })

  const mutating =
    createMutation.isPending ||
    patchMutation.isPending ||
    reissueMutation.isPending ||
    removeMutation.isPending

  const pageItems = listQuery.data?.items ?? []
  const total = listQuery.data?.total ?? 0
  const pageSize = listQuery.data?.pageSize ?? STAFF_LIST_PAGE_SIZE

  const listError = listQuery.isError
    ? t(resolveApiErrorI18nKey(listQuery.error))
    : ''

  const onSortChange = (key: UsersListSortKey): void => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )
    setPage(1)
  }

  const onQueryChange = (value: string): void => {
    setQ(value)
    setPage(1)
  }

  const onRoleFilterChange = (role: UsersRoleFilter): void => {
    setRoleFilter(role)
    setPage(1)
  }

  const onRowActivate = (user: UserListItem): void => {
    if (!user.latestAppId) {
      setRowMessage(t('usersAdmin.noApps'))
      return
    }
    setRowMessage('')
    navigate(`${appsBase}/${user.latestAppId}`)
  }

  const onApplyConfirm = (): void => {
    if (!confirmAction) {
      return
    }
    if (confirmAction.kind === 'reissue') {
      reissueMutation.mutate(confirmAction.userId)
      return
    }
    if (confirmAction.kind === 'toggleActive') {
      patchMutation.mutate({
        userId: confirmAction.userId,
        active: !confirmAction.active,
      })
      return
    }
    removeMutation.mutate(confirmAction.userId)
  }

  const createForm: ReactNode = (
    <CreateUserForm
      apiError={createError}
      allowedRoles={allowedCreateRoles}
      onValidSubmit={async ({ name, email, login, role }): Promise<boolean> => {
        try {
          await createMutation.mutateAsync({
            name,
            role,
            ...(email.trim() ? { email: email.trim() } : {}),
            ...(login.trim() ? { login: login.trim() } : {}),
          })
          return true
        } catch {
          return false
        }
      }}
    />
  )

  return (
    <UsersRender
      pageItems={pageItems}
      total={total}
      page={page}
      pageSize={pageSize}
      loading={listQuery.isLoading}
      listError={listError}
      actionError={actionError}
      createForm={createForm}
      createOpen={createOpen}
      canOpenCreate={Boolean(session)}
      issued={issued}
      q={q}
      roleFilter={roleFilter}
      sort={sort}
      rowMessage={rowMessage}
      sessionUserId={session?.userId}
      mutating={mutating}
      confirmAction={confirmAction}
      canMutateTarget={(targetRole: Role): boolean =>
        canMutateUser({ actorRole, targetRole })
      }
      onOpenCreate={(): void => {
        setCreateError('')
        setCreateOpen(true)
      }}
      onCloseCreate={(): void => setCreateOpen(false)}
      onQueryChange={onQueryChange}
      onRoleFilterChange={onRoleFilterChange}
      onSortChange={onSortChange}
      onPageChange={setPage}
      onRowActivate={onRowActivate}
      onCopyCredentials={(issuedAccess): void => {
        void navigator.clipboard.writeText(
          `Vises\n${t('usersAdmin.issued.login')}: ${issuedAccess.user.login}\n${t('usersAdmin.issued.password')}: ${issuedAccess.password}`,
        )
      }}
      onRequestConfirm={setConfirmAction}
      onCancelConfirm={(): void => setConfirmAction(null)}
      onApplyConfirm={onApplyConfirm}
    />
  )
}
