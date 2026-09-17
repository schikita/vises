import { Link } from 'react-router-dom'
import type { Application } from '@/entities/application'
import { statusLabel } from '@/entities/application'
import { formatDate } from '@/shared/lib'
import { Card, Empty, StatusBadge } from '@/shared/ui'

type VisitsRenderProps = {
  visits: Application[]
  cities: string[]
  city: string
  onlyUpcoming: boolean
  appsBase: string
  onCityChange: (city: string) => void
  onToggleUpcoming: () => void
}

export const VisitsRender = ({
  visits,
  cities,
  city,
  onlyUpcoming,
  appsBase,
  onCityChange,
  onToggleUpcoming,
}: VisitsRenderProps) => (
  <div>
    <h1 className="text-2xl font-extrabold tracking-tight">Визиты</h1>
    <p className="mt-1 text-sm text-muted">Записи в визовый центр: дата, время и город подачи.</p>

    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      <select className="field sm:max-w-[220px]" value={city} onChange={(e) => onCityChange(e.target.value)}>
        <option value="all">Все города</option>
        {cities.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <button
        className={`rounded-full px-3 py-1.5 text-xs font-bold ${onlyUpcoming ? 'bg-forest text-white' : 'border border-line bg-white'}`}
        onClick={onToggleUpcoming}
      >
        {onlyUpcoming ? 'Ближайшие' : 'Все визиты'}
      </button>
    </div>

    <Card className="mt-5 overflow-hidden p-0">
      {visits.length === 0 ? (
        <Empty title="Визитов нет" text="Когда заявке назначат дату, она появится здесь." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#f7f4ee] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-bold">Заявитель</th>
                <th className="px-4 py-3 font-bold">Город</th>
                <th className="px-4 py-3 font-bold">Дата</th>
                <th className="px-4 py-3 font-bold">Время</th>
                <th className="px-4 py-3 font-bold">Куда</th>
                <th className="px-4 py-3 font-bold">Статус</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((a) => {
                const person = a.applicants[0]
                const name = person ? `${person.firstName} ${person.lastName}` : a.code
                return (
                  <tr key={a.id} className="border-t border-line hover:bg-[#fbf8f2]">
                    <td className="px-4 py-3">
                      <Link
                        to={`${appsBase}/${a.id}`}
                        className="font-bold text-ink no-underline"
                      >
                        {name || a.code}
                      </Link>
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
  </div>
)
