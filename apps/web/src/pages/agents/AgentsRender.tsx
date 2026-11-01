import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, Empty, ListPager } from '@/shared/ui'
import type { AgentsRenderProps } from './types'

export const AgentsRender = ({
  agents,
  loading,
  listError,
  notice,
  empty,
  total,
  page,
  pageSize,
  q,
  onQueryChange,
  onPageChange,
}: AgentsRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {t('balance.agents.title')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t('balance.agents.subtitle')}
            {total > 0 ? t('balance.agents.totalSuffix', { total }) : null}
          </p>
        </div>
        <label className="block w-full sm:w-64">
          <span className="sr-only">{t('balance.agents.searchLabel')}</span>
          <input
            className="field"
            type="search"
            value={q}
            onChange={(event): void => {
              onQueryChange(event.target.value)
            }}
            placeholder={t('balance.agents.searchPlaceholder')}
          />
        </label>
      </div>

      {notice ? (
        <p className="mt-4 text-sm font-medium text-text-secondary" role="status">
          {notice}
        </p>
      ) : null}

      {listError ? (
        <p className="mt-4 text-sm font-medium text-danger" role="alert">
          {listError}
        </p>
      ) : null}

      {loading ? (
        <Empty
          title={t('balance.agents.loadingTitle')}
          text={t('balance.agents.loadingText')}
        />
      ) : null}

      {!loading && empty ? (
        <Empty
          title={t('balance.agents.emptyTitle')}
          text={t('balance.agents.emptyText')}
        />
      ) : null}

      {!loading && !empty ? (
        <Card className="mt-5 overflow-hidden p-0">
          <ul className="divide-y divide-border">
            {agents.map(
              (agent): React.ReactElement => (
                <li key={agent.id}>
                  <Link
                    to={`/admin/agents/${agent.id}`}
                    state={{
                      agentName: agent.name,
                      agentLogin: agent.login,
                    }}
                    className="flex items-center justify-between gap-3 px-4 py-3 no-underline transition hover:bg-surface-muted"
                  >
                    <div>
                      <p className="font-semibold text-text-primary">{agent.name}</p>
                      <p className="text-sm text-text-secondary">{agent.login}</p>
                    </div>
                    <span className="text-sm font-medium text-forest">
                      {t('balance.agents.openBalance')}
                    </span>
                  </Link>
                </li>
              ),
            )}
          </ul>
        </Card>
      ) : null}

      {!loading ? (
        <ListPager
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
        />
      ) : null}
    </div>
  )
}
