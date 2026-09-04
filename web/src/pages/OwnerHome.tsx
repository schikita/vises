import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { ROLE_LABEL, money, type Status } from '../types'
import { Card, StatusBadge } from '../ui'

export function OwnerHome() {
  const { apps, users } = useStore()
  const unpaid = apps.filter((a) => !a.paymentPaid).reduce((s, a) => s + a.paymentAmount, 0)
  const paid = apps.filter((a) => a.paymentPaid).reduce((s, a) => s + a.paymentAmount, 0)
  const byRole = (role: 'admin' | 'manager' | 'client') =>
    users.filter((u) => u.role === role).length
  const byStatus = (id: Status) => apps.filter((a) => a.status === id).length
  const recent = [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  const kpis = [
    ['Пользователи', String(users.length)],
    ['Клиенты', String(byRole('client'))],
    ['Агенты', String(byRole('manager'))],
    ['Заявки', String(apps.length)],
    ['Не оплачено', money(unpaid)],
  ]

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Кабинет админа</h1>
      <p className="mt-1 text-sm text-muted">
        Полный контроль: люди, доступы, заявки, оплаты и настройки системы.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map(([label, value]) => (
          <Card key={label} className="py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
            <p className="mt-1 text-2xl font-extrabold">{value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <p className="font-bold">Последние пользователи</p>
            <Link to="/owner/users" className="text-sm font-bold text-leaf">
              Все
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recent.map((u) => (
              <li key={u.id} className="flex items-center justify-between text-sm">
                <span>
                  <span className="font-semibold">{u.name}</span>
                  <span className="text-muted"> · {u.login}</span>
                </span>
                <span className="text-xs font-bold text-muted">{ROLE_LABEL[u.role]}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <Link
              to="/owner/users"
              className="inline-flex rounded-xl bg-forest px-4 py-2.5 text-sm font-bold text-white"
            >
              Добавить пользователя
            </Link>
          </div>
        </Card>
        <Card>
          <p className="font-bold">Система</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-muted">Оплачено</span>
              <b>{money(paid)}</b>
            </li>
            <li className="flex justify-between">
              <span className="text-muted">На проверке</span>
              <b>{byStatus('review')}</b>
            </li>
            <li className="flex justify-between">
              <span className="text-muted">Нужны правки</span>
              <b>{byStatus('fixes')}</b>
            </li>
            <li className="flex justify-between">
              <span className="text-muted">Отключённые</span>
              <b>{users.filter((u) => !u.active).length}</b>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge status="docs" />
            <StatusBadge status="review" />
            <StatusBadge status="booked" />
          </div>
        </Card>
      </div>
    </div>
  )
}
