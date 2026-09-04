import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { formatDate, staffBase } from '../types'
import { Card, Empty, StatusBadge } from '../ui'

export function Visits() {
  const { apps, session } = useStore()
  const [city, setCity] = useState('all')
  const [onlyUpcoming, setOnlyUpcoming] = useState(true)
  const today = new Date().toISOString().slice(0, 10)
  const cities = [...new Set(apps.map((a) => a.submitCity).filter(Boolean))]

  const visits = useMemo(() => {
    return apps
      .filter((a) => a.visitDate || a.status === 'booked' || a.status === 'done')
      .filter((a) => (city === 'all' ? true : a.submitCity === city))
      .filter((a) => (onlyUpcoming ? a.visitDate >= today && a.status !== 'done' : true))
      .sort((a, b) => `${a.visitDate} ${a.visitTime}`.localeCompare(`${b.visitDate} ${b.visitTime}`))
  }, [apps, city, onlyUpcoming, today])

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Визиты</h1>
      <p className="mt-1 text-sm text-muted">Записи в визовый центр: дата, время и город подачи.</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <select className="field sm:max-w-[220px]" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">Все города</option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${onlyUpcoming ? 'bg-forest text-white' : 'border border-line bg-white'}`}
          onClick={() => setOnlyUpcoming((v) => !v)}
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
                        <Link to={`${staffBase(session?.role)}/apps/${a.id}`} className="font-bold text-ink no-underline">
                          {name || a.code}
                        </Link>
                        <p className="text-xs text-muted">{a.code}</p>
                      </td>
                      <td className="px-4 py-3">{a.submitCity}</td>
                      <td className="px-4 py-3 font-semibold">{formatDate(a.visitDate)}</td>
                      <td className="px-4 py-3">{a.visitTime || '—'}</td>
                      <td className="px-4 py-3 text-muted">{a.visitPlace || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
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
}
