import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Copy, Link2, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import type { IssuedAccess } from '../store'
import type { Role } from '../types'
import { ROLE_LABEL, formatDateTime, invitePath, publicUrl } from '../types'
import { Avatar, Btn, Card, Empty, Field } from '../ui'

function inviteUrl(token: string) {
  return publicUrl(invitePath(token))
}

export function UsersPage() {
  const { users, createUser, updateUser, reissueAccess, removeUser, refreshUsers, session } =
    useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [login, setLogin] = useState('')
  const [role, setRole] = useState<Role>('client')
  const [error, setError] = useState('')
  const [issued, setIssued] = useState<IssuedAccess | null>(null)
  const [copied, setCopied] = useState(false)
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')

  useEffect(() => {
    void refreshUsers()
  }, [refreshUsers])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (!query) return true
      return `${u.name} ${u.login} ${u.email}`.toLowerCase().includes(query)
    })
  }, [users, q, roleFilter])

  async function submit(e: FormEvent) {
    e.preventDefault()
    const result = await createUser({ name, email, login, role })
    if (typeof result === 'string') {
      setError(result)
      setIssued(null)
      return
    }
    setError('')
    setIssued(result)
    setName('')
    setEmail('')
    setLogin('')
    setRole('client')
  }

  function copyLink(token: string) {
    void navigator.clipboard.writeText(inviteUrl(token))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
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
          <form className="space-y-3" onSubmit={submit}>
            <Field label="Имя">
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label="Email">
              <input
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="необязательно, можно только логин"
              />
            </Field>
            <Field label="Логин">
              <input
                className="field"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="если пусто — из email или имени"
              />
            </Field>
            <Field label="Роль">
              <select className="field" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="client">Клиент</option>
                <option value="manager">Агент</option>
                <option value="admin">Админ</option>
              </select>
            </Field>
            {error && <p className="text-sm font-semibold text-clay">{error}</p>}
            <Btn type="submit" className="w-full">
              <Plus size={16} />
              Создать и выдать ссылку
            </Btn>
          </form>
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
                <Btn onClick={() => copyLink(issued.token)}>
                  <Link2 size={14} />
                  {copied ? 'Скопировано' : 'Копировать ссылку'}
                </Btn>
                <Btn
                  variant="ghost"
                  className="bg-white"
                  onClick={() =>
                    void navigator.clipboard.writeText(
                      `Vises\nЛогин: ${issued.user.login}\nПароль: ${issued.password}\nСсылка: ${inviteUrl(issued.token)}`,
                    )
                  }
                >
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
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="field sm:max-w-[180px]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}
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
                              onClick={() => copyLink(u.inviteToken)}
                            >
                              Ссылка
                            </button>
                            <button
                              className="text-xs font-bold text-ink"
                              type="button"
                              onClick={() => {
                                void reissueAccess(u.id).then((result) => {
                                  if (typeof result === 'string') setError(result)
                                  else {
                                    setError('')
                                    setIssued(result)
                                  }
                                })
                              }}
                            >
                              <span className="inline-flex items-center gap-1">
                                <RefreshCw size={12} /> Новый пароль
                              </span>
                            </button>
                            <button
                              className="text-xs font-bold text-muted"
                              type="button"
                              onClick={() => {
                                void updateUser(u.id, { active: !u.active }).then((err) => {
                                  if (err) setError(err)
                                })
                              }}
                            >
                              {u.active ? 'Отключить' : 'Включить'}
                            </button>
                            {session?.userId !== u.id && (
                              <button
                                className="text-xs font-bold text-clay"
                                type="button"
                                onClick={() => {
                                  void removeUser(u.id).then((err) => {
                                    if (err) setError(err)
                                  })
                                }}
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
}
