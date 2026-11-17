import type { ReactElement } from 'react'
import { Copy, Link2, Plus } from 'lucide-react'
import { inviteUrl } from '@/entities/session'
import type { Role } from '@/entities/user'
import { ROLE_LABEL } from '@/entities/user'
import { formatDateTime } from '@/shared/lib'
import { UserDetailDialog } from '@/features/users-admin'
import { Avatar, Btn, Card, Dialog, Empty, ListPager } from '@/shared/ui'
import {
  USERS_EMPTY_TEXT,
  USERS_EMPTY_TITLE,
  USERS_LIST_SORT_COLUMNS,
  USERS_LOADING_TEXT,
  USERS_PAGE_TITLE,
} from './constants'
import { SortIcon } from './SortIcon'
import type { UsersRenderProps } from './types'

export const UsersRender = ({
  pageItems,
  total,
  page,
  pageSize,
  loading,
  listError,
  createForm,
  createOpen,
  selectedUser,
  issued,
  copied,
  q,
  roleFilter,
  sort,
  onOpenCreate,
  onCloseCreate,
  onCloseUserDetail,
  onQueryChange,
  onRoleFilterChange,
  onSortChange,
  onPageChange,
  onRowActivate,
  onOpenLatestApp,
  onCopyLink,
  onCopyCredentials,
  actorRole,
  actorId,
  statusBusy,
  statusError,
  onSetActive,
}: UsersRenderProps): ReactElement => {
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{USERS_PAGE_TITLE}</h1>
          <p className="mt-1 text-sm text-muted">
            {total}
            {total > 0 ? ` · показано ${rangeStart}–${rangeEnd}` : null}
          </p>
        </div>
        <Btn onClick={onOpenCreate}>
          <Plus size={16} />
          Новый пользователь
        </Btn>
      </div>

      {listError ? (
        <p className="mt-4 text-sm font-semibold text-clay" role="alert">
          {listError}
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {issued && (
          <Card className="border-leaf/40 bg-[#f3f8f5]">
            <p className="font-bold">Доступ для {issued.user.name}</p>
            <p className="mt-2 text-sm">
              Логин: <b>{issued.user.login}</b>
            </p>
            <p className="text-sm">
              Пароль: <b>{issued.password}</b>
            </p>
            <p className="mt-2 break-all text-xs text-muted">{inviteUrl(issued.token)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn onClick={() => onCopyLink(issued.token)}>
                <Link2 size={14} />
                {copied ? 'Скопировано' : 'Копировать ссылку'}
              </Btn>
              <Btn variant="ghost" className="bg-white" onClick={() => onCopyCredentials(issued)}>
                <Copy size={14} />
                Логин и пароль
              </Btn>
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="field"
            placeholder="Поиск по имени или логину"
            value={q}
            onChange={(e) => onQueryChange(e.target.value)}
          />
          <select
            className="field sm:max-w-[180px]"
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value as Role | 'all')}
          >
            <option value="all">Все роли</option>
            <option value="superadmin">Суперадмин</option>
            <option value="admin">Админ</option>
            <option value="agent">Агент</option>
          </select>
        </div>

        <Card className="overflow-hidden p-0">
          {loading && pageItems.length === 0 ? (
            <Empty title="Загрузка…" text={USERS_LOADING_TEXT} />
          ) : pageItems.length === 0 ? (
            <Empty title={USERS_EMPTY_TITLE} text={USERS_EMPTY_TEXT} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] table-fixed text-left text-sm">
                <thead className="bg-[#f7f4ee] text-xs uppercase text-muted">
                  <tr>
                    {USERS_LIST_SORT_COLUMNS.map((col) => (
                      <th key={col.key} className={`px-4 py-3 font-bold ${col.thClassName}`}>
                        <button
                          type="button"
                          className="inline-flex max-w-full items-center gap-1.5 text-left uppercase tracking-wide hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                          onClick={() => onSortChange(col.key)}
                        >
                          <span className="truncate">{col.label}</span>
                          <SortIcon active={sort.key === col.key} dir={sort.dir} />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((u) => (
                    <tr
                      key={u.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer border-t border-line hover:bg-[#fbf8f2]"
                      onClick={() => onRowActivate(u)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onRowActivate(u)
                        }
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar name={u.name} size={36} />
                          <span className="min-w-0">
                            <span className="block truncate font-bold">{u.name}</span>
                            <span className="block truncate text-xs text-muted">{u.login}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">{ROLE_LABEL[u.role]}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${
                            u.active ? 'bg-[#e4f3ea] text-[#1f6b42]' : 'bg-[#fbe7e0] text-clay'
                          }`}
                        >
                          {u.active ? 'Активен' : 'Отключён'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums text-muted">
                        {formatDateTime(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <ListPager page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
      </div>

      <Dialog open={createOpen} title="Новый пользователь" onClose={onCloseCreate}>
        {createForm}
      </Dialog>

      <UserDetailDialog
        user={selectedUser}
        actorRole={actorRole}
        actorId={actorId}
        statusBusy={statusBusy}
        statusError={statusError}
        onClose={onCloseUserDetail}
        onOpenLatestApp={onOpenLatestApp}
        onSetActive={onSetActive}
      />
    </div>
  )
}
