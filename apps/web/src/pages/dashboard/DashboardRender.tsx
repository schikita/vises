import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { statusLabel } from '@/entities/application'
import { Card, StatusBadge } from '@/shared/ui'
import { DASHBOARD_COPY } from './constants'
import type { DashboardRenderProps } from './types'
import { resolveDashboardStatusLabel } from './utils'

export const DashboardRender = ({
  loading,
  error,
  upcoming,
  statusRows,
  cities,
  appsBase,
}: DashboardRenderProps): ReactElement => (
  <div>
    <h1 className="text-2xl font-extrabold tracking-tight">
      {DASHBOARD_COPY.title}
    </h1>
    <p className="mt-1 text-sm text-muted">{DASHBOARD_COPY.subtitle}</p>

    <div className="mt-5">
      <Link
        to={appsBase}
        className="inline-flex rounded-xl bg-forest px-4 py-2.5 text-sm font-bold text-white"
      >
        {DASHBOARD_COPY.appsCta}
      </Link>
    </div>

    {loading ? (
      <p className="mt-6 text-sm text-muted" role="status">
        {DASHBOARD_COPY.loading}
      </p>
    ) : null}

    {error ? (
      <p className="mt-6 text-sm font-semibold text-clay" role="alert">
        {error}
      </p>
    ) : null}

    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <Card>
        <p className="font-bold">{DASHBOARD_COPY.statusTitle}</p>
        {statusRows.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{DASHBOARD_COPY.statusEmpty}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {statusRows.map((row) => (
              <li key={row.status}>
                <Link
                  to={appsBase}
                  className="flex items-center justify-between text-sm"
                >
                  <StatusBadge
                    status={row.status}
                    label={statusLabel(row.status)}
                  />
                  <span className="font-bold text-forest">{row.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <p className="font-bold">{DASHBOARD_COPY.citiesTitle}</p>
        {cities.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{DASHBOARD_COPY.citiesEmpty}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {cities.map((row) => (
              <li
                key={row.city}
                className="flex items-center justify-between text-sm"
              >
                <Link to={appsBase} className="font-semibold text-forest">
                  {row.city}
                </Link>
                <span className="text-muted">{row.count} заявок</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 font-bold">{DASHBOARD_COPY.upcomingTitle}</p>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            {DASHBOARD_COPY.upcomingEmpty}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {upcoming.map((a) => (
              <li key={a.id}>
                <Link
                  to={`${appsBase}/${a.id}`}
                  className="text-sm font-semibold text-forest"
                >
                  {a.visitDate} {a.visitTime} · {a.primaryLastName} ·{' '}
                  {resolveDashboardStatusLabel(a.status)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  </div>
)
