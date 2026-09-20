import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Search } from 'lucide-react'
import type { Application, Status } from '@/entities/application'
import { STATUSES, statusLabel } from '@/entities/application'
import { formatDate } from '@/shared/lib'
import { Avatar, Btn, Card, Empty, ListPager, StatusBadge } from '@/shared/ui'
import { APPS_LIST_SORT_COLUMNS } from './constants'
import type { AppsListSortKey, AppsListSortState } from './types'

type ApplicationsRenderProps = {
  filteredCount: number
  pageItems: Application[]
  cities: string[]
  q: string
  status: Status | 'all'
  city: string
  page: number
  pageSize: number
  sort: AppsListSortState
  loading: boolean
  error: string
  appsBase: string
  onQueryChange: (q: string) => void
  onStatusChange: (status: Status | 'all') => void
  onCityChange: (city: string) => void
  onPageChange: (page: number) => void
  onSortChange: (key: AppsListSortKey) => void
}

const SortIcon = ({ active, dir }: { active: boolean; dir: AppsListSortState['dir'] }) => {
  if (!active) return <ArrowUpDown size={12} className="opacity-40" />
  return dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
}

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
  appsBase,
  onQueryChange,
  onStatusChange,
  onCityChange,
  onPageChange,
  onSortChange,
}: ApplicationsRenderProps) => {
  const rangeStart = filteredCount === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, filteredCount)

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Заявки</h1>
          <p className="mt-1 text-sm text-muted">
            {filteredCount}
            {filteredCount > 0 ? ` · показано ${rangeStart}–${rangeEnd}` : null}
          </p>
        </div>
        <Btn to={`${appsBase}/new`}>
          <Plus size={16} />
          Создать
        </Btn>
      </div>

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
            placeholder="Имя, фамилия, паспорт, номер заявки"
            value={q}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Поиск заявок"
          />
        </label>
        <select className="field lg:max-w-[180px]" value={city} onChange={(e) => onCityChange(e.target.value)}>
          <option value="all">Все города</option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${status === 'all' ? 'bg-forest text-white' : 'bg-white border border-line'}`}
          onClick={() => onStatusChange('all')}
        >
          Все
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.id}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${status === s.id ? 'bg-forest text-white' : 'bg-white border border-line'}`}
            onClick={() => onStatusChange(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Card className="mt-5 overflow-hidden p-0">
        {loading && pageItems.length === 0 ? (
          <Empty title="Загрузка…" text="Получаем список заявок." />
        ) : filteredCount === 0 ? (
          <Empty title="Ничего не нашлось" text="Сбросьте фильтр или создайте заявку." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#f7f4ee] text-xs uppercase tracking-wide text-muted">
                <tr>
                  {APPS_LIST_SORT_COLUMNS.map((col) => (
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
                {pageItems.map((a) => {
                  const person = a.applicants[0]
                  const name = person ? `${person.firstName} ${person.lastName}` : a.code
                  return (
                    <tr key={a.id} className="border-t border-line hover:bg-[#fbf8f2]">
                      <td className="px-4 py-3">
                        <Link
                          to={`${appsBase}/${a.id}`}
                          className="flex items-center gap-3 text-ink no-underline"
                        >
                          <Avatar name={name} size={36} />
                          <span>
                            <span className="block font-bold">{name}</span>
                            <span className="text-xs text-muted">
                              {a.code} · заявителей: {a.applicants.length}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-semibold">{a.category || a.visaType}</td>
                      <td className="px-4 py-3">{a.submitCity}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} label={statusLabel(a.status)} />
                      </td>
                      <td className="px-4 py-3 text-muted">{formatDate(a.travelDate)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ListPager page={page} pageSize={pageSize} total={filteredCount} onPageChange={onPageChange} />
    </div>
  )
}
