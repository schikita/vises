import { Link } from 'react-router-dom'
import type { Application } from '@/entities/application'
import { money } from '@/entities/application'
import { formatDate } from '@/shared/lib'
import { Card, Empty, ListPager } from '@/shared/ui'

type PaymentsRenderProps = {
  apps: Application[]
  total: number
  page: number
  pageSize: number
  paidLabel: string
  unpaidLabel: string
  loading: boolean
  error: string
  appsBase: string
  onPageChange: (page: number) => void
}

export const PaymentsRender = ({
  apps,
  total,
  page,
  pageSize,
  paidLabel,
  unpaidLabel,
  loading,
  error,
  appsBase,
  onPageChange,
}: PaymentsRenderProps) => (
  <div>
    <h1 className="text-2xl font-extrabold tracking-tight">Платежи</h1>

    {error ? (
      <p className="mt-4 text-sm font-semibold text-clay" role="alert">
        {error}
      </p>
    ) : null}

    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <Card>
        <p className="text-xs font-bold uppercase text-muted">Оплачено</p>
        <p className="mt-1 text-2xl font-extrabold text-leaf">{paidLabel}</p>
      </Card>
      <Card>
        <p className="text-xs font-bold uppercase text-muted">Не оплачено</p>
        <p className="mt-1 text-2xl font-extrabold text-clay">{unpaidLabel}</p>
      </Card>
    </div>

    <Card className="mt-5 overflow-hidden p-0">
      {loading && apps.length === 0 ? (
        <Empty title="Загрузка…" text="Получаем список платежей." />
      ) : total === 0 ? (
        <Empty title="Платежей нет" text="Когда появятся заявки, суммы отобразятся здесь." />
      ) : (
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
                  <Link to={`${appsBase}/${a.id}`} className="font-bold text-ink">
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
      )}
    </Card>

    <ListPager page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
  </div>
)
