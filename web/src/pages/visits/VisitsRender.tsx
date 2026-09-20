import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react'
import type { Application } from '@/entities/application'
import { statusLabel } from '@/entities/application'
import { formatDate } from '@/shared/lib'
import { Card, Empty, ListPager, StatusBadge } from '@/shared/ui'
import { VISITS_FILTER_HELP, VISITS_FILTER_OPTIONS, VISITS_LIST_SORT_COLUMNS } from './constants'
import type { VisitsFilterMode, VisitsListSortKey, VisitsListSortState } from './types'
import { resolveVisitsApplicantName } from './utils'

type VisitsRenderProps = {
  visits: Application[]
  total: number
  cities: string[]
  city: string
  filterMode: VisitsFilterMode
  q: string
  sort: VisitsListSortState
  page: number
  pageSize: number
  loading: boolean
  error: string
  onCityChange: (city: string) => void
  onFilterModeChange: (mode: VisitsFilterMode) => void
  onQueryChange: (q: string) => void
  onSortChange: (key: VisitsListSortKey) => void
  onPageChange: (page: number) => void
  onRowActivate: (appId: string) => void
}

const SortIcon = ({ active, dir }: { active: boolean; dir: VisitsListSortState['dir'] }) => {
  if (!active) return <ArrowUpDown size={12} className="opacity-40" />
  return dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
}

export const VisitsRender = ({
  visits,
  total,
  cities,
  city,
  filterMode,
  q,
  sort,
  page,
  pageSize,
  loading,
  error,
  onCityChange,
  onFilterModeChange,
  onQueryChange,
  onSortChange,
  onPageChange,
  onRowActivate,
}: VisitsRenderProps) => (
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

    <div className="mt-5 flex flex-col gap-3 lg:flex-row">
      <label className="field flex flex-1 items-center gap-2 py-0">
        <Search size={16} className="shrink-0 text-muted" aria-hidden />
        <input
          className="min-w-0 flex-1 border-0 bg-transparent py-[11px] outline-none"
          placeholder="Имя заявителя, email, логин или код заявки"
          value={q}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Поиск визитов"
        />
      </label>
      <select className="field lg:max-w-[220px]" value={city} onChange={(e) => onCityChange(e.target.value)}>
        <option value="all">Все города</option>
        {cities.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </div>

    <div className="mt-3">
      <div
        className="inline-flex flex-wrap gap-2"
        role="group"
        aria-label="Фильтр визитов"
      >
        {VISITS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.mode}
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              filterMode === opt.mode ? 'bg-forest text-white' : 'border border-line bg-white'
            }`}
            aria-pressed={filterMode === opt.mode}
            onClick={() => onFilterModeChange(opt.mode)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="mt-2 max-w-3xl text-xs text-muted">{VISITS_FILTER_HELP[filterMode]}</p>
    </div>

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
                      <SortIcon active={sort.key === col.key} dir={sort.dir} />
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
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} label={statusLabel(a.status)} />
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
