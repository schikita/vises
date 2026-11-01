import { Copy, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '@/shared/lib'
import { Avatar, Btn, Card, Dialog, Empty, ListPager } from '@/shared/ui'
import { USERS_LIST_SORT_COLUMNS, USERS_ROLE_FILTER_OPTIONS } from './constants'
import type { UsersRenderProps } from './types'
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
  canMutateTarget,
  onOpenCreate,
  onCloseCreate,
  onQueryChange,
  onRoleFilterChange,
  onSortChange,
  onPageChange,
  onRowActivate,
  onCopyCredentials,
  onReissue,
  onToggleActive,
  onRemove,
}: UsersRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {t('usersAdmin.title')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t('usersAdmin.subtitle')}
            {total > 0 ? t('usersAdmin.totalSuffix', { total }) : null}
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
          <Card className="border-accent/30 bg-accent-subtle">
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

        <Card className="overflow-hidden p-0">
          {loading && pageItems.length === 0 ? (
            <Empty
              title={t('usersAdmin.loadingTitle')}
              text={t('usersAdmin.loadingText')}
            />
          ) : pageItems.length === 0 ? (
            <Empty title={t('usersAdmin.emptyTitle')} text={t('usersAdmin.emptyText')} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-accent-subtle text-xs uppercase text-text-secondary">
                  <tr>
                    {USERS_LIST_SORT_COLUMNS.map((col) => (
                      <th key={col.key} className="px-4 py-3 font-semibold">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 text-left uppercase tracking-wide hover:text-text-primary"
                          onClick={(): void => onSortChange(col.key)}
                        >
                          {t(col.labelKey)}
                          <UsersListSortIcon
                            active={sort.key === col.key}
                            dir={sort.dir}
                          />
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-3 font-semibold">
                      {t('usersAdmin.columns.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((u) => {
                    const allowMutate = canMutateTarget(u.role)
                    return (
                      <tr
                        key={u.id}
                        role="link"
                        tabIndex={0}
                        className="cursor-pointer border-t border-border hover:bg-accent-subtle/50"
                        onClick={(): void => onRowActivate(u)}
                        onKeyDown={(e): void => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onRowActivate(u)
                          }
                        }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={u.name} size={36} />
                            <span>
                              <span className="block font-semibold text-text-primary">
                                {u.name}
                              </span>
                              <span className="text-xs text-text-secondary">{u.login}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-text-primary">
                          {t(`usersAdmin.roles.${u.role}`)}
                        </td>
                        <td className="px-4 py-3">
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
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {formatDateTime(u.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className="flex flex-wrap gap-2"
                            onClick={(e): void => e.stopPropagation()}
                            onKeyDown={(e): void => e.stopPropagation()}
                          >
                            {allowMutate ? (
                              <>
                                <button
                                  className="text-xs font-medium text-text-primary"
                                  type="button"
                                  disabled={mutating}
                                  onClick={(): void => onReissue(u.id)}
                                >
                                  <span className="inline-flex items-center gap-1">
                                    <RefreshCw size={12} />
                                    {t('usersAdmin.actions.reissue')}
                                  </span>
                                </button>
                                <button
                                  className="text-xs font-medium text-text-secondary"
                                  type="button"
                                  disabled={mutating}
                                  onClick={(): void => onToggleActive(u.id, u.active)}
                                >
                                  {u.active
                                    ? t('usersAdmin.actions.disable')
                                    : t('usersAdmin.actions.enable')}
                                </button>
                                {sessionUserId !== u.id ? (
                                  <button
                                    className="text-xs font-medium text-danger"
                                    type="button"
                                    disabled={mutating}
                                    onClick={(): void => onRemove(u.id)}
                                  >
                                    <span className="inline-flex items-center gap-1">
                                      <Trash2 size={12} />
                                      {t('usersAdmin.actions.remove')}
                                    </span>
                                  </button>
                                ) : null}
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <ListPager page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
      </div>

      <Dialog
        open={createOpen}
        title={t('usersAdmin.createDialogTitle')}
        onClose={onCloseCreate}
      >
        {createForm}
      </Dialog>
    </div>
  )
}
