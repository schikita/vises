import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { UserListItem } from '@/entities/user'
import { DataTable, Empty, ListPager, type DataTableColumnDef } from '@/shared/ui'
import { AGENTS_LIST_SORT_COLUMNS } from './constants'
import type { AgentsRenderProps } from './types'
import { AgentsListSortIcon } from './AgentsListSortIcon'

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
  sort,
  onQueryChange,
  onSortChange,
  onPageChange,
}: AgentsRenderProps): React.ReactElement => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const columns: DataTableColumnDef<UserListItem>[] = AGENTS_LIST_SORT_COLUMNS.map(
    (col): DataTableColumnDef<UserListItem> => ({
      id: col.key,
      header: (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-left uppercase tracking-wide hover:text-text-primary"
          onClick={(): void => onSortChange(col.key)}
        >
          {t(col.labelKey)}
          <AgentsListSortIcon active={sort.key === col.key} dir={sort.dir} />
        </button>
      ),
      cell: (agent): React.ReactNode => {
        if (col.key === 'name') {
          return (
            <>
              <p className="font-semibold text-text-primary">{agent.name}</p>
              <p className="text-xs text-text-secondary">{agent.login}</p>
            </>
          )
        }
        if (col.key === 'clientsCount') {
          return (
            <span className="tabular-nums text-text-primary">
              {agent.clientsCount === null
                ? t('balance.agents.metricEmpty')
                : agent.clientsCount}
            </span>
          )
        }
        if (col.key === 'currentBalance') {
          return (
            <span className="font-medium tabular-nums text-text-primary">
              {agent.currentBalance ?? t('balance.agents.metricEmpty')}
            </span>
          )
        }
        return (
          <span className="font-medium tabular-nums text-text-primary">
            {agent.totalRevenue ?? t('balance.agents.metricEmpty')}
          </span>
        )
      },
    }),
  )

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

      {!loading ? (
        <div className="mt-5">
          <DataTable
            columns={columns}
            data={empty ? [] : agents}
            getRowId={(row): string => row.id}
            onRowClick={(agent): void => {
              navigate(`/admin/agents/${agent.id}`, {
                state: {
                  agentName: agent.name,
                  agentLogin: agent.login,
                },
              })
            }}
            emptyTitle={t('balance.agents.emptyTitle')}
            emptyText={t('balance.agents.emptyText')}
            tableClassName="min-w-[720px]"
          />
        </div>
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
