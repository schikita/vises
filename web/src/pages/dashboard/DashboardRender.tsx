import { Link } from 'react-router-dom'
import type { Application, Status } from '@/entities/application'
import { statusLabel } from '@/entities/application'
import { Card, StatusBadge } from '@/shared/ui'

type DashboardRenderProps = {
  apps: Application[]
  appsCount: number
  kpis: string[][]
  cities: string[]
  upcoming: Application[]
  byStatus: (id: Status) => number
  appsBase: string
}

export const DashboardRender = ({
  apps,
  appsCount,
  kpis,
  cities,
  upcoming,
  byStatus,
  appsBase,
}: DashboardRenderProps) => (
  <div>
    <h1 className="text-2xl font-extrabold tracking-tight">Дашборд</h1>
    <p className="mt-1 text-sm text-muted">Сводка по заявкам. Без лишней вложенности.</p>

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
        <p className="font-bold">По статусам</p>
        <ul className="mt-4 space-y-3">
          {(
            [
              'new',
              'docs',
              'review',
              'ready',
              'booked',
              'done',
              'fixes',
              'autofill_ok',
              'autofill_failed',
              'declined',
            ] as Status[]
          ).map((id) => {
            const n = byStatus(id)
            const max = Math.max(appsCount, 1)
            return (
              <li key={id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <StatusBadge status={id} label={statusLabel(id)} />
                  <span className="font-bold">{n}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-leaf"
                    style={{ width: `${(n / max) * 100}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </Card>
      <Card>
        <p className="font-bold">Города подачи</p>
        <ul className="mt-4 space-y-3">
          {cities.map((city) => {
            const n = apps.filter((a) => a.submitCity === city).length
            return (
              <li key={city} className="flex items-center justify-between text-sm">
                <span className="font-semibold">{city}</span>
                <span className="text-muted">{n} заявок</span>
              </li>
            )
          })}
        </ul>
        <p className="mt-6 font-bold">Ближайшие визиты</p>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Пока нет назначенных дат.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {upcoming.map((a) => (
              <li key={a.id}>
                <Link to={`${appsBase}/${a.id}`} className="text-sm font-semibold text-forest">
                  {a.visitDate} {a.visitTime} · {a.applicants[0]?.lastName} · {statusLabel(a.status)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  </div>
)
