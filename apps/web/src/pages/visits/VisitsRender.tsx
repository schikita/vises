import type { ReactElement } from 'react'
import { Search } from 'lucide-react'
import { formatDate, formatDateTime } from '@/shared/lib'
import { Card, DateRangePicker, Empty, ListPager } from '@/shared/ui'
import {
  VISITS_DATE_RANGE_ARIA_LABEL,
  VISITS_DATE_RANGE_HELP,
  VISITS_DATE_RANGE_PLACEHOLDER,
  VISITS_DATE_RANGE_PRESET_LABELS,
  VISITS_LIST_SORT_COLUMNS,
} from './constants'
import type { VisitsRenderProps } from './types'
import { resolveVisitsApplicantName } from './utils'
import { VisitsSortIcon } from './VisitsSortIcon'
import './visits-filters.css'

export const VisitsRender = ({
  visits,
  total,
  cities,
  city,
  from,
  to,
  q,
  sort,
  page,
  pageSize,
  loading,
  error,
  onCityChange,
  onFromChange,
  onToChange,
  onQueryChange,
  onSortChange,
  onPageChange,
  onRowActivate,
}: VisitsRenderProps): ReactElement => (
  <div>
    <h1 className="text-2xl font-extrabold tracking-tight">Визиты</h1>
    <p className="mt-1 text-sm text-muted">
      Записи в визовый центр: дата, время и город подачи.
      {total > 0 ? ` · ${total}` : null}
    </p>

    {error ? (
      <p className="mt-4 text-sm font-semibold text-clay" role="alert">
        {error}
      </p>
    ) : null}

    <div className="visits-filters mt-5 flex flex-col gap-3 lg:flex-row">
      <label className="field visits-filters__control visits-filters__search flex-1">
        <Search size={16} className="shrink-0 text-muted" aria-hidden />
        <input
          className="visits-filters__search-input"
          placeholder="Имя заявителя, email, логин или код заявки"
          value={q}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Поиск визитов"
        />
      </label>
      <select
        className="field visits-filters__control visits-filters__city"
        value={city}
        onChange={(e) => onCityChange(e.target.value)}
        aria-label="Город визита"
      >
        <option value="all">Все города</option>
        {cities.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <div className="visits-filters__range">
        <DateRangePicker
          from={from}
          to={to}
          onFromChange={onFromChange}
          onToChange={onToChange}
          placeholder={VISITS_DATE_RANGE_PLACEHOLDER}
          ariaLabel={VISITS_DATE_RANGE_ARIA_LABEL}
          presetLabels={VISITS_DATE_RANGE_PRESET_LABELS}
        />
      </div>
    </div>
    <p className="mt-2 max-w-3xl text-xs text-muted">{VISITS_DATE_RANGE_HELP}</p>

    <Card className="mt-5 overflow-hidden p-0">
      {loading && visits.length === 0 ? (
        <Empty title="Загрузка…" text="Получаем список визитов." />
      ) : visits.length === 0 ? (
        <Empty title="Визитов нет" text="Когда заявке назначат дату, она появится здесь." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#f7f4ee] text-xs uppercase tracking-wide text-muted">
              <tr>
                {VISITS_LIST_SORT_COLUMNS.map((col) => (
                  <th key={col.key} className="px-4 py-3 font-bold">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-left uppercase tracking-wide hover:text-ink"
                      onClick={() => onSortChange(col.key)}
                    >
                      {col.label}
                      <VisitsSortIcon active={sort.key === col.key} dir={sort.dir} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visits.map((a) => {
                const name = resolveVisitsApplicantName(a)
                return (
                  <tr
                    key={a.id}
                    role="link"
                    tabIndex={0}
                    className="cursor-pointer border-t border-line hover:bg-[#fbf8f2]"
                    onClick={() => onRowActivate(a.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onRowActivate(a.id)
                      }
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className="font-bold text-ink">{name || a.code}</span>
                      <p className="text-xs text-muted">{a.code}</p>
                    </td>
                    <td className="px-4 py-3">{a.submitCity}</td>
                    <td className="px-4 py-3 font-semibold">{formatDate(a.visitDate)}</td>
                    <td className="px-4 py-3">{a.visitTime || '—'}</td>
                    <td className="px-4 py-3 text-muted">{a.visitPlace || '—'}</td>
                    <td className="px-4 py-3 text-muted">
                      {a.createdAt ? formatDateTime(a.createdAt) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>

    <ListPager page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
  </div>
)
