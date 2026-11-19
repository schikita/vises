import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { APPLICATION_STATUSES } from '@vises/contracts'
import { formatDate } from '@/shared/lib'
import {
  Avatar,
  Card,
  DataTable,
  Empty,
  ListPager,
  StatusBadge,
  type DataTableColumnDef,
} from '@/shared/ui'
import { APPS_LIST_SORT_COLUMNS } from './constants'
import type { ApplicationsListRow, ApplicationsRenderProps } from './types'
import { ApplicationsEmptyCreateCta } from './ui/ApplicationsEmptyCreateCta'
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
  createCtaTo,
  createCtaLabel,
  onQueryChange,
  onStatusChange,
  onCityChange,
  onPageChange,
  onSortChange,
}: ApplicationsRenderProps): React.ReactElement => {
  const { t } = useTranslation()
  const rangeStart = filteredCount === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, filteredCount)

  const columns: DataTableColumnDef<ApplicationsListRow>[] = [
    ...APPS_LIST_SORT_COLUMNS.map(
      (col): DataTableColumnDef<ApplicationsListRow> => ({
        id: col.key,
        header: (
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
            <AppsListSortIcon active={sort.key === col.key} dir={sort.dir} />
          </button>
        ),
        cell: (row): React.ReactNode => {
          if (col.key === 'name') {
            return (
              <Link
                to={`${appsBase}/${row.id}`}
                className="flex items-center gap-3 text-ink no-underline"
              >
                <Avatar name={row.clientName || row.code} size={36} />
                <span>
                  <span className="block font-bold">{row.clientName}</span>
                  <span className="text-xs text-muted">{row.code}</span>
                </span>
              </Link>
            )
          }
          if (col.key === 'category') {
            return (
              <span className="font-semibold">
                {row.category || row.visaType}
              </span>
            )
          }
          if (col.key === 'city') {
            return row.submitCity
          }
          if (col.key === 'status') {
            const statusLabel = row.applicationStatus
              ? t(`applications.status.${row.applicationStatus}`)
              : row.status
            return <StatusBadge status={row.status} label={statusLabel} />
          }
          return <span className="text-muted">{formatDate(row.travelDate)}</span>
        },
      }),
    ),
    {
      id: 'client',
      header: t('applications.list.columns.client'),
      cell: (row): React.ReactNode => {
        if (row.clientId) {
          return (
            <Link
              to={`${clientsBase}/${row.clientId}`}
              className="text-sm font-medium text-forest no-underline hover:underline"
            >
              {t('applications.list.openClient')}
            </Link>
          )
        }
        return <span className="text-xs text-muted">—</span>
      },
    },
  ]

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {t('applications.list.title')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t('applications.list.subtitle')}
            {!loading && filteredCount > 0
              ? ` · ${rangeStart}–${rangeEnd} / ${filteredCount}`
              : null}
          </p>
        </div>
        {createCtaTo ? (
          <ApplicationsEmptyCreateCta
            to={createCtaTo}
            label={createCtaLabel}
          />
        ) : null}
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

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          className="field"
          type="search"
          value={q}
          onChange={(e): void => {
            onQueryChange(e.target.value)
          }}
          placeholder={t('applications.list.searchPlaceholder')}
          aria-label={t('applications.list.searchLabel')}
        />
        <label className="block w-full sm:max-w-[220px]">
          <span className="sr-only">{t('applications.list.allCities')}</span>
          <select
            className="field"
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
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Status">
        <button
          type="button"
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
            status === 'all'
              ? 'bg-accent text-white'
              : 'border border-border bg-white text-slate-900'
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
                  ? 'bg-accent text-white'
                  : 'border border-border bg-white text-slate-900'
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

      <div className="mt-5">
        {loading ? (
          <Card className="overflow-hidden p-0">
            <Empty
              title={t('applications.list.loadingTitle')}
              text={t('applications.list.loadingText')}
            />
          </Card>
        ) : pageItems.length === 0 ? (
          <Card className="overflow-hidden p-0">
            <Empty
              title={t('applications.list.emptyTitle')}
              text={t('applications.list.emptyText')}
            />
            {createCtaTo ? (
              <div className="flex justify-center pb-12 -mt-8">
                <ApplicationsEmptyCreateCta
                  to={createCtaTo}
                  label={createCtaLabel}
                />
              </div>
            ) : null}
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={pageItems}
            getRowId={(row): string => row.id}
            emptyTitle={t('applications.list.emptyTitle')}
            emptyText={t('applications.list.emptyText')}
            tableClassName="min-w-[720px]"
          />
        )}
      </div>

      {loading ? null : (
        <ListPager
          page={page}
          pageSize={pageSize}
          total={filteredCount}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
