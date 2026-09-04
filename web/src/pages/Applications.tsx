import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useStore } from '../store'
import type { Status } from '../types'
import { STATUSES, formatDate, staffBase } from '../types'
import { Avatar, Btn, Card, Empty, StatusBadge } from '../ui'

export function Applications() {
  const { apps, session } = useStore()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<Status | 'all'>('all')
  const [city, setCity] = useState('all')

  const cities = [...new Set(apps.map((a) => a.submitCity))]
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return apps.filter((a) => {
      if (status !== 'all' && a.status !== status) return false
      if (city !== 'all' && a.submitCity !== city) return false
      if (!query) return true
      const blob = [
        a.code,
        a.destination,
        a.submitCity,
        ...a.applicants.flatMap((p) => [p.firstName, p.lastName, p.passportNumber]),
      ]
        .join(' ')
        .toLowerCase()
      return blob.includes(query)
    })
  }, [apps, q, status, city])

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Заявки</h1>
          <p className="mt-1 text-sm text-muted">
            {filtered.length} из {apps.length}
          </p>
        </div>
        <Btn to={`${staffBase(session?.role)}/apps/new`}>
          <Plus size={16} />
          Создать
        </Btn>
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="field pl-9"
            placeholder="Имя, фамилия, паспорт, номер заявки"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="field lg:max-w-[180px]" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">Все города</option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${status === 'all' ? 'bg-forest text-white' : 'bg-white border border-line'}`}
          onClick={() => setStatus('all')}
        >
          Все
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.id}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${status === s.id ? 'bg-forest text-white' : 'bg-white border border-line'}`}
            onClick={() => setStatus(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Card className="mt-5 overflow-hidden p-0">
        {filtered.length === 0 ? (
          <Empty title="Ничего не нашлось" text="Сбросьте фильтр или создайте заявку." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#f7f4ee] text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-bold">Заявка</th>
                  <th className="px-4 py-3 font-bold">Категория</th>
                  <th className="px-4 py-3 font-bold">Город</th>
                  <th className="px-4 py-3 font-bold">Статус</th>
                  <th className="px-4 py-3 font-bold">Поездка</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const person = a.applicants[0]
                  const name = person ? `${person.firstName} ${person.lastName}` : a.code
                  return (
                    <tr key={a.id} className="border-t border-line hover:bg-[#fbf8f2]">
                      <td className="px-4 py-3">
                        <Link to={`${staffBase(session?.role)}/apps/${a.id}`} className="flex items-center gap-3 text-ink no-underline">
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
                        <StatusBadge status={a.status} />
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
    </div>
  )
}
