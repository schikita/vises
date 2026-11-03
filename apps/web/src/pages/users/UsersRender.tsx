import { Ban, Copy, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { UserListItem } from '@/entities/user'
import { formatDateTime } from '@/shared/lib'
import {
  Avatar,
  Btn,
  Card,
  DataTable,
  Dialog,
  Empty,
  ListPager,
  type DataTableColumnDef,
} from '@/shared/ui'
import {
  USERS_ACTION_BUTTON_CLASS,
  USERS_ACTION_BUTTON_DANGER_CLASS,
  USERS_LIST_SORT_COLUMNS,
  USERS_ROLE_FILTER_OPTIONS,
} from './constants'
import type { UsersRenderProps } from './types'
import { UsersConfirmDialog } from './UsersConfirmDialog'
import { UsersListSortIcon } from './UsersListSortIcon'

export const UsersRender = ({
  pageItems,
  total,
  page,
  pageSize,
  loading,
  listError,
  actionError,
  createForm,
  createOpen,
  canOpenCreate,
  issued,
  q,
  roleFilter,
  sort,
  rowMessage,
  sessionUserId,
  mutating,
  confirmAction,
  canMutateTarget,
  onOpenCreate,
  onCloseCreate,
  onQueryChange,
  onRoleFilterChange,
  onSortChange,
  onPageChange,
  onRowActivate,
  onCopyCredentials,
  onRequestConfirm,
  onCancelConfirm,
  onApplyConfirm,
}: UsersRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  const columns: DataTableColumnDef<UserListItem>[] = [
    ...USERS_LIST_SORT_COLUMNS.map(
      (col): DataTableColumnDef<UserListItem> => ({
        id: col.key,
        header: (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-left uppercase tracking-wide hover:text-text-primary"
            onClick={(): void => onSortChange(col.key)}
          >
            {t(col.labelKey)}
            <UsersListSortIcon active={sort.key === col.key} dir={sort.dir} />
          </button>
        ),
        cell: (u): React.ReactNode => {
          if (col.key === 'user') {
            return (
              <div className="flex items-center gap-3">
                <Avatar name={u.name} size={36} />
                <span>
                  <span className="block font-semibold text-text-primary">
                    {u.name}
                  </span>
                  <span className="text-xs text-text-secondary">{u.login}</span>
                </span>
              </div>
            )
          }
          if (col.key === 'role') {
            return (
              <span className="font-medium text-text-primary">
                {t(`usersAdmin.roles.${u.role}`)}
              </span>
            )
          }
          if (col.key === 'status') {
            return (
              <span
                className={`inline-flex rounded-control px-2.5 py-1 text-xs font-medium ${
                  u.active
                    ? 'bg-accent-subtle text-success'
                    : 'bg-accent-subtle text-danger'
                }`}
              >
                {u.active
                  ? t('usersAdmin.status.active')
                  : t('usersAdmin.status.inactive')}
              </span>
            )
          }
          return (
            <span className="text-text-secondary">
              {formatDateTime(u.createdAt)}
            </span>
          )
        },
      }),
    ),
    {
      id: 'actions',
      header: t('usersAdmin.columns.actions'),
      cell: (u): React.ReactNode => {
        const allowMutate = canMutateTarget(u.role)
        return (
          <div
            className="flex flex-wrap gap-1"
            onClick={(e): void => e.stopPropagation()}
            onKeyDown={(e): void => e.stopPropagation()}
          >
            {allowMutate ? (
              <>
                <button
                  className={USERS_ACTION_BUTTON_CLASS}
                  type="button"
                  disabled={mutating}
                  aria-label={t('usersAdmin.actions.reissue')}
                  title={t('usersAdmin.actions.reissue')}
                  onClick={(): void =>
                    onRequestConfirm({
                      kind: 'reissue',
                      userId: u.id,
                      userName: u.name,
                    })
                  }
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  className={USERS_ACTION_BUTTON_CLASS}
                  type="button"
                  disabled={mutating}
                  aria-label={
                    u.active
                      ? t('usersAdmin.actions.disable')
                      : t('usersAdmin.actions.enable')
                  }
                  title={
                    u.active
                      ? t('usersAdmin.actions.disable')
                      : t('usersAdmin.actions.enable')
                  }
                  onClick={(): void =>
                    onRequestConfirm({
                      kind: 'toggleActive',
                      userId: u.id,
                      userName: u.name,
                      active: u.active,
                    })
                  }
                >
                  <Ban size={16} />
                </button>
                {sessionUserId !== u.id ? (
                  <button
                    className={USERS_ACTION_BUTTON_DANGER_CLASS}
                    type="button"
                    disabled={mutating}
                    aria-label={t('usersAdmin.actions.remove')}
                    title={t('usersAdmin.actions.remove')}
                    onClick={(): void =>
                      onRequestConfirm({
                        kind: 'remove',
                        userId: u.id,
                        userName: u.name,
                      })
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {t('usersAdmin.title')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t('usersAdmin.subtitle', { total })}
          </p>
        </div>
        {canOpenCreate ? (
          <Btn onClick={onOpenCreate} disabled={mutating}>
            <Plus size={16} />
            {t('usersAdmin.newUser')}
          </Btn>
        ) : null}
      </div>

      {rowMessage ? (
        <p className="mt-4 text-sm font-medium text-warning" role="status">
          {rowMessage}
        </p>
      ) : null}

      {listError ? (
        <p className="mt-4 text-sm font-medium text-danger" role="alert">
          {listError}
        </p>
      ) : null}

      {actionError ? (
        <p className="mt-4 text-sm font-medium text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {issued ? (
          <Card className="rounded-panel border border-accent/30 bg-accent-subtle px-5 py-5">
            <p className="font-semibold text-text-primary">
              {t('usersAdmin.issued.title', { name: issued.user.name })}
            </p>
            <p className="mt-2 text-sm text-text-primary">
              {t('usersAdmin.issued.login')}: <b>{issued.user.login}</b>
            </p>
            <p className="text-sm text-text-primary">
              {t('usersAdmin.issued.password')}: <b>{issued.password}</b>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn onClick={(): void => onCopyCredentials(issued)}>
                <Copy size={14} />
                {t('usersAdmin.issued.copyCredentials')}
              </Btn>
            </div>
          </Card>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="field"
            placeholder={t('usersAdmin.searchPlaceholder')}
            value={q}
            onChange={(e): void => onQueryChange(e.target.value)}
          />
          <select
            className="field sm:max-w-[180px]"
            value={roleFilter}
            onChange={(e): void =>
              onRoleFilterChange(e.target.value as UsersRenderProps['roleFilter'])
            }
          >
            <option value="all">{t('usersAdmin.roleFilterAll')}</option>
            {USERS_ROLE_FILTER_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {t(`usersAdmin.roles.${role}`)}
              </option>
            ))}
          </select>
        </div>

        {loading && pageItems.length === 0 ? (
          <Card className="overflow-hidden rounded-panel border border-border p-0">
            <Empty
              title={t('usersAdmin.loadingTitle')}
              text={t('usersAdmin.loadingText')}
            />
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={pageItems}
            getRowId={(row): string => row.id}
            onRowClick={onRowActivate}
            emptyTitle={t('usersAdmin.emptyTitle')}
            emptyText={t('usersAdmin.emptyText')}
            tableClassName="min-w-[720px]"
          />
        )}

        <ListPager page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
      </div>

      <Dialog
        open={createOpen}
        title={t('usersAdmin.createDialogTitle')}
        onClose={onCloseCreate}
      >
        {createForm}
      </Dialog>

      <UsersConfirmDialog
        open={confirmAction !== null}
        pending={mutating}
        action={confirmAction}
        onCancel={onCancelConfirm}
        onApply={onApplyConfirm}
      />
    </div>
  )
}
