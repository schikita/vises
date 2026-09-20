import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Copy, Link2, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { inviteUrl } from '@/entities/session'
import type { IssuedAccess, Role, UserListItem } from '@/entities/user'
import { ROLE_LABEL } from '@/entities/user'
import { formatDateTime } from '@/shared/lib'
import { Avatar, Btn, Card, Dialog, Empty, ListPager } from '@/shared/ui'
import { USERS_LIST_SORT_COLUMNS } from './constants'
import type { UsersListSortKey, UsersListSortState } from './types'

type UsersRenderProps = {
  pageItems: UserListItem[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  listError: string
  createForm: ReactNode
  createOpen: boolean
  issued: IssuedAccess | null
  copied: boolean
  q: string
  roleFilter: Role | 'all'
  sort: UsersListSortState
  rowMessage: string
  sessionUserId?: string
  onOpenCreate: () => void
  onCloseCreate: () => void
  onQueryChange: (q: string) => void
  onRoleFilterChange: (role: Role | 'all') => void
  onSortChange: (key: UsersListSortKey) => void
  onPageChange: (page: number) => void
  onRowActivate: (user: UserListItem) => void
  onCopyLink: (token: string) => void
  onCopyCredentials: (issued: IssuedAccess) => void
  onReissue: (userId: string) => void
  onToggleActive: (userId: string, active: boolean) => void
  onRemove: (userId: string) => void
}

const SortIcon = ({ active, dir }: { active: boolean; dir: UsersListSortState['dir'] }) => {
  if (!active) return <ArrowUpDown size={12} className="opacity-40" />
  return dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
}

export const UsersRender = ({
  pageItems,
  total,
  page,
  pageSize,
  loading,
  listError,
  createForm,
  createOpen,
  issued,
  copied,
  q,
  roleFilter,
  sort,
  rowMessage,
  sessionUserId,
  onOpenCreate,
  onCloseCreate,
  onQueryChange,
  onRoleFilterChange,
  onSortChange,
  onPageChange,
  onRowActivate,
  onCopyLink,
  onCopyCredentials,
  onReissue,
  onToggleActive,
  onRemove,
}: UsersRenderProps) => (
  <div>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Пользователи</h1>
        <p className="mt-1 text-sm text-muted">
          Создайте доступ и отправьте ссылку с логином и паролем.
          {total > 0 ? ` · ${total}` : null}
        </p>
      </div>
      <Btn onClick={onOpenCreate}>
        <Plus size={16} />
        Новый пользователь
      </Btn>
    </div>

    {rowMessage ? (
      <p className="mt-4 text-sm font-semibold text-clay" role="status">
        {rowMessage}
      </p>
    ) : null}

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
          <option value="admin">Админ</option>
          <option value="manager">Агент</option>
          <option value="client">Клиент</option>
        </select>
      </div>

      <Card className="overflow-hidden p-0">
        {loading && pageItems.length === 0 ? (
          <Empty title="Загрузка…" text="Получаем список пользователей." />
        ) : pageItems.length === 0 ? (
          <Empty
            title="Никого нет"
            text="Нажмите «Новый пользователь», чтобы создать доступ."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#f7f4ee] text-xs uppercase text-muted">
                <tr>
                  {USERS_LIST_SORT_COLUMNS.map((col) => (
                    <th key={col.key} className="px-4 py-3 font-bold">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-left uppercase tracking-wide hover:text-ink"
                        onClick={() => onSortChange(col.key)}
                      >
                        {col.label}
                        <SortIcon active={sort.key === col.key} dir={sort.dir} />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 font-bold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((u) => (
                  <tr
                    key={u.id}
                    role="link"
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
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size={36} />
                        <span>
                          <span className="block font-bold">{u.name}</span>
                          <span className="text-xs text-muted">{u.login}</span>
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
                    <td className="px-4 py-3 text-muted">{formatDateTime(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div
                        className="flex flex-wrap gap-2"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <button
                          className="text-xs font-bold text-leaf"
                          type="button"
                          onClick={() => onCopyLink(u.inviteToken)}
                        >
                          Ссылка
                        </button>
                        <button
                          className="text-xs font-bold text-ink"
                          type="button"
                          onClick={() => onReissue(u.id)}
                        >
                          <span className="inline-flex items-center gap-1">
                            <RefreshCw size={12} /> Новый пароль
                          </span>
                        </button>
                        <button
                          className="text-xs font-bold text-muted"
                          type="button"
                          onClick={() => onToggleActive(u.id, u.active)}
                        >
                          {u.active ? 'Отключить' : 'Включить'}
                        </button>
                        {sessionUserId !== u.id && (
                          <button
                            className="text-xs font-bold text-clay"
                            type="button"
                            onClick={() => onRemove(u.id)}
                          >
                            <span className="inline-flex items-center gap-1">
                              <Trash2 size={12} />
                              Удалить
                            </span>
                          </button>
                        )}
                      </div>
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
  </div>
)
