import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { formatDate, money, staffBase } from '../types'
import { Card } from '../ui'

export function Payments() {
  const { apps, session } = useStore()
  const paid = apps.filter((a) => a.paymentPaid).reduce((s, a) => s + a.paymentAmount, 0)
  const unpaid = apps.filter((a) => !a.paymentPaid).reduce((s, a) => s + a.paymentAmount, 0)

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Платежи</h1>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-bold uppercase text-muted">Оплачено</p>
          <p className="mt-1 text-2xl font-extrabold text-leaf">{money(paid)}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-muted">Не оплачено</p>
          <p className="mt-1 text-2xl font-extrabold text-clay">{money(unpaid)}</p>
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[#f7f4ee] text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 font-bold">Заявка</th>
              <th className="px-4 py-3 font-bold">Сумма</th>
              <th className="px-4 py-3 font-bold">Статус</th>
              <th className="px-4 py-3 font-bold">Заметка</th>
              <th className="px-4 py-3 font-bold">Создана</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link to={`${staffBase(session?.role)}/apps/${a.id}`} className="font-bold text-ink">
                    {a.code} · {a.applicants[0]?.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 font-bold text-leaf">{money(a.paymentAmount)}</td>
                <td className="px-4 py-3">{a.paymentPaid ? 'Оплачено' : 'Не оплачено'}</td>
                <td className="px-4 py-3 text-muted">{a.paymentNote || '—'}</td>
                <td className="px-4 py-3 text-muted">{formatDate(a.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
