import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { ROLE_LABEL } from '@/entities/user'
import { Card } from '@/shared/ui'
import { OWNER_HOME_COPY } from './constants'
import { OwnerHomeStatsSummary } from './OwnerHomeStatsSummary'
import { OwnerHomeTopAgentsCard } from './OwnerHomeTopAgentsCard'
import type { OwnerHomeRenderProps } from './types'

export const OwnerHomeRender = ({
  loading,
  error,
  analyticsError,
  appsTotal,
  agentsTotal,
  recent,
  topAgents,
  cities,
  appsBase,
  usersBase,
}: OwnerHomeRenderProps): ReactElement => (
  <div>
    <h1 className="text-2xl font-extrabold tracking-tight">
      {OWNER_HOME_COPY.title}
    </h1>
    <p className="mt-1 text-sm text-muted">{OWNER_HOME_COPY.subtitle}</p>

    <div className="mt-5">
      <Link
        to={appsBase}
        className="inline-flex rounded-xl bg-forest px-4 py-2.5 text-sm font-bold text-white"
      >
        {OWNER_HOME_COPY.appsCta}
      </Link>
    </div>

    {loading ? (
      <p className="mt-6 text-sm text-muted" role="status">
        {OWNER_HOME_COPY.loading}
      </p>
    ) : null}

    {error ? (
      <p className="mt-6 text-sm font-semibold text-clay" role="alert">
        {error}
      </p>
    ) : null}

    {analyticsError ? (
      <p className="mt-6 text-sm font-semibold text-clay" role="alert">
        {analyticsError}
      </p>
    ) : null}

    {!loading ? (
      <OwnerHomeStatsSummary
        appsTotal={appsTotal}
        agentsTotal={agentsTotal}
      />
    ) : null}

    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      {!loading ? <OwnerHomeTopAgentsCard rows={topAgents} /> : null}

      <Card>
        <div className="flex items-center justify-between">
          <p className="font-bold">{OWNER_HOME_COPY.recentUsersTitle}</p>
          <Link to={usersBase} className="text-sm font-bold text-leaf">
            {OWNER_HOME_COPY.recentUsersAll}
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            {OWNER_HOME_COPY.recentUsersEmpty}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recent.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  <span className="font-semibold">{u.name}</span>
                  <span className="text-muted"> · {u.login}</span>
                </span>
                <span className="text-xs font-bold text-muted">
                  {ROLE_LABEL[u.role]}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5">
          <Link
            to={usersBase}
            className="inline-flex rounded-xl bg-forest px-4 py-2.5 text-sm font-bold text-white"
          >
            {OWNER_HOME_COPY.addUser}
          </Link>
        </div>
      </Card>

      <Card>
        <p className="font-bold">{OWNER_HOME_COPY.citiesTitle}</p>
        {cities.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            {OWNER_HOME_COPY.citiesEmpty}
          </p>
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
      </Card>
    </div>
  </div>
)
