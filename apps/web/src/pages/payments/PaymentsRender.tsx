import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { money } from '@/entities/application'
import { formatDate } from '@/shared/lib'
import { Card, Empty, ListPager } from '@/shared/ui'
import { PAYMENTS_LIST_SORT_COLUMNS } from './constants'
import type { PaymentsRenderProps } from './types'
import { PaymentsSortIcon } from './PaymentsSortIcon'

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
  sort,
  onSortChange,
  onPageChange,
}: PaymentsRenderProps): ReactElement => (
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] table-fixed text-left text-sm">
            <thead className="bg-[#f7f4ee] text-xs uppercase text-muted">
              <tr>
                {PAYMENTS_LIST_SORT_COLUMNS.map((col) => (
                  <th key={col.key} className={`px-4 py-3 font-bold ${col.thClassName}`}>
                    <button
                      type="button"
                      className="inline-flex max-w-full items-center gap-1.5 text-left uppercase tracking-wide hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      onClick={() => onSortChange(col.key)}
                    >
                      <span className="truncate">{col.label}</span>
                      <PaymentsSortIcon active={sort.key === col.key} dir={sort.dir} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link
                      to={`${appsBase}/${a.id}`}
                      className="block truncate font-bold text-ink"
                    >
                      {a.code} · {a.applicants[0]?.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums text-leaf">
                    {money(a.paymentAmount)}
                  </td>
                  <td className="px-4 py-3">
                    {a.paymentPaid ? 'Оплачено' : 'Не оплачено'}
                  </td>
                  <td className="px-4 py-3 truncate text-muted">
                    {a.paymentNote || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums text-muted">
                    {formatDate(a.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>

    <ListPager page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
  </div>
)
