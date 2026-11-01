import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { APPLICATION_STATUSES } from '@vises/contracts'
import { formatDate } from '@/shared/lib'
import { Avatar, Card, Empty, ListPager, StatusBadge } from '@/shared/ui'
import { APPS_LIST_SORT_COLUMNS } from './constants'
import type { ApplicationsRenderProps } from './types'
import { AppsListSortIcon } from './ui/AppsListSortIcon'

export const ApplicationsRender = ({
  filteredCount,
  pageItems,
  cities,
  q,
  status,
  city,
  page,
  pageSize,
  sort,
  loading,
  error,
  notice,
  appsBase,
  clientsBase,
  onQueryChange,
  onStatusChange,
  onCityChange,
  onPageChange,
  onSortChange,
}: ApplicationsRenderProps): React.ReactElement => {
  const { t } = useTranslation()
  const rangeStart = filteredCount === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, filteredCount)

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {t('applications.list.title')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t('applications.list.subtitle')}
            {filteredCount > 0
              ? ` · ${rangeStart}–${rangeEnd} / ${filteredCount}`
              : null}
          </p>
        </div>
      </div>

      {notice ? (
        <p className="mt-4 text-sm font-medium text-text-secondary" role="status">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 lg:flex-row">
        <label className="field flex flex-1 items-center gap-2 py-0">
          <Search size={16} className="shrink-0 text-muted" aria-hidden />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent py-[11px] outline-none"
            placeholder={t('applications.list.searchPlaceholder')}
            value={q}
            onChange={(e): void => {
              onQueryChange(e.target.value)
            }}
            aria-label={t('applications.list.searchLabel')}
          />
        </label>
        <select
          className="field lg:max-w-[180px]"
          value={city}
          onChange={(e): void => {
            onCityChange(e.target.value)
          }}
        >
          <option value="all">{t('applications.list.allCities')}</option>
          {cities.map(
            (c): React.ReactElement => (
              <option key={c} value={c}>
                {c}
              </option>
            ),
          )}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Status">
        <button
          type="button"
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
            status === 'all'
              ? 'bg-forest text-white'
              : 'border border-line bg-white'
          }`}
          onClick={(): void => {
            onStatusChange('all')
          }}
        >
          {t('applications.list.allStatuses')}
        </button>
        {APPLICATION_STATUSES.map(
          (s): React.ReactElement => (
            <button
              key={s}
              type="button"
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                status === s
                  ? 'bg-forest text-white'
                  : 'border border-line bg-white'
              }`}
              onClick={(): void => {
                onStatusChange(s)
              }}
            >
              {t(`applications.status.${s}`)}
            </button>
          ),
        )}
      </div>

      <Card className="mt-5 overflow-hidden p-0">
        {loading && pageItems.length === 0 ? (
          <Empty
            title={t('applications.list.loadingTitle')}
            text={t('applications.list.loadingText')}
          />
        ) : filteredCount === 0 ? (
          <Empty
            title={t('applications.list.emptyTitle')}
            text={t('applications.list.emptyText')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-wide text-text-secondary">
                <tr>
                  {APPS_LIST_SORT_COLUMNS.map(
                    (col): React.ReactElement => (
                      <th key={col.key} className="px-4 py-3 font-bold">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 text-left uppercase tracking-wide hover:text-ink"
                          onClick={(): void => {
                            onSortChange(col.key)
                          }}
                        >
                          {t(`applications.list.columns.${
                            col.key === 'name'
                              ? 'application'
                              : col.key === 'city'
                                ? 'city'
                                : col.key === 'category'
                                  ? 'category'
                                  : col.key === 'status'
                                    ? 'status'
                                    : 'travelDate'
                          }`)}
                          <AppsListSortIcon
                            active={sort.key === col.key}
                            dir={sort.dir}
                          />
                        </button>
                      </th>
                    ),
                  )}
                  <th className="px-4 py-3 font-bold">
                    {t('applications.list.columns.client')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map(
                  (row): React.ReactElement => {
                    const statusLabel = row.applicationStatus
                      ? t(`applications.status.${row.applicationStatus}`)
                      : row.status
                    return (
                      <tr
                        key={row.id}
                        className="border-t border-border hover:bg-surface-muted/40"
                      >
                        <td className="px-4 py-3">
                          <Link
                            to={`${appsBase}/${row.id}`}
                            className="flex items-center gap-3 text-ink no-underline"
                          >
                            <Avatar name={row.clientName || row.code} size={36} />
                            <span>
                              <span className="block font-bold">
                                {row.clientName}
                              </span>
                              <span className="text-xs text-muted">{row.code}</span>
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {row.category || row.visaType}
                        </td>
                        <td className="px-4 py-3">{row.submitCity}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={row.status} label={statusLabel} />
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {formatDate(row.travelDate)}
                        </td>
                        <td className="px-4 py-3">
                          {row.clientId ? (
                            <Link
                              to={`${clientsBase}/${row.clientId}`}
                              className="text-sm font-medium text-forest no-underline hover:underline"
                            >
                              {t('applications.list.openClient')}
                            </Link>
                          ) : (
                            <span className="text-xs text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ListPager
        page={page}
        pageSize={pageSize}
        total={filteredCount}
        onPageChange={onPageChange}
      />
    </div>
  )
}
