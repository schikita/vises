import type { ReactNode } from 'react'
import { Copy, Link2, RefreshCw, Trash2 } from 'lucide-react'
import { inviteUrl } from '@/entities/session'
import type { IssuedAccess, Role, User } from '@/entities/user'
import { ROLE_LABEL } from '@/entities/user'
import { formatDateTime } from '@/shared/lib'
import { Avatar, Btn, Card, Empty } from '@/shared/ui'

type UsersRenderProps = {
  filtered: User[]
  createForm: ReactNode
  issued: IssuedAccess | null
  copied: boolean
  q: string
  roleFilter: Role | 'all'
  sessionUserId?: string
  onQueryChange: (q: string) => void
  onRoleFilterChange: (role: Role | 'all') => void
  onCopyLink: (token: string) => void
  onCopyCredentials: (issued: IssuedAccess) => void
  onReissue: (userId: string) => void
  onToggleActive: (userId: string, active: boolean) => void
  onRemove: (userId: string) => void
}

export const UsersRender = ({
  filtered,
  createForm,
  issued,
  copied,
  q,
  roleFilter,
  sessionUserId,
  onQueryChange,
  onRoleFilterChange,
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
        </p>
      </div>
    </div>

    <div className="mt-6 grid gap-5 lg:grid-cols-[340px_1fr]">
      <Card>
        <p className="mb-4 font-bold">Новый пользователь</p>
        {createForm}
      </Card>

      <div className="space-y-4">
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
          {filtered.length === 0 ? (
            <Empty title="Никого нет" text="Создайте первого пользователя слева." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-[#f7f4ee] text-xs uppercase text-muted">
                  <tr>
                    <th className="px-4 py-3 font-bold">Пользователь</th>
                    <th className="px-4 py-3 font-bold">Роль</th>
                    <th className="px-4 py-3 font-bold">Статус</th>
                    <th className="px-4 py-3 font-bold">Создан</th>
                    <th className="px-4 py-3 font-bold">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-t border-line">
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
                        <div className="flex flex-wrap gap-2">
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
      </div>
    </div>
  </div>
)
