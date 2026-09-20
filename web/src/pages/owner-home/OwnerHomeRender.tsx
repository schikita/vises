import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '@/entities/user'
import { ROLE_LABEL } from '@/entities/user'
import { statusLabel } from '@/entities/application'
import { Card, StatusBadge } from '@/shared/ui'

type OwnerHomeRenderProps = {
  kpis: string[][]
  recent: User[]
  paid: string
  reviewCount: number
  fixesCount: number
  inactiveCount: number
  charts: ReactNode
}

export const OwnerHomeRender = ({
  kpis,
  recent,
  paid,
  reviewCount,
  fixesCount,
  inactiveCount,
  charts,
}: OwnerHomeRenderProps) => (
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

    {charts}

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
            <b>{paid}</b>
          </li>
          <li className="flex justify-between">
            <span className="text-muted">На проверке</span>
            <b>{reviewCount}</b>
          </li>
          <li className="flex justify-between">
            <span className="text-muted">Нужны правки</span>
            <b>{fixesCount}</b>
          </li>
          <li className="flex justify-between">
            <span className="text-muted">Отключённые</span>
            <b>{inactiveCount}</b>
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge status="docs" label={statusLabel('docs')} />
          <StatusBadge status="review" label={statusLabel('review')} />
          <StatusBadge status="booked" label={statusLabel('booked')} />
        </div>
      </Card>
    </div>
  </div>
)
