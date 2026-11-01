import { useTranslation } from 'react-i18next'
import { formatDateTime } from '@/shared/lib'
import { Empty } from '@/shared/ui'
import type { BalanceLedgerTableProps } from '../../types'

/** Newest-first ledger table; amounts rendered as API decimal strings. */
export const BalanceLedgerTable = ({
  items,
  emptyTitle,
  emptyText,
}: BalanceLedgerTableProps): React.ReactElement => {
  const { t } = useTranslation()

  if (items.length === 0) {
    return <Empty title={emptyTitle} text={emptyText} />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-surface-muted text-text-secondary">
          <tr>
            <th className="px-3 py-2 font-medium">{t('balance.ledger.columns.createdAt')}</th>
            <th className="px-3 py-2 font-medium">{t('balance.ledger.columns.type')}</th>
            <th className="px-3 py-2 font-medium">{t('balance.ledger.columns.amount')}</th>
            <th className="px-3 py-2 font-medium">{t('balance.ledger.columns.reason')}</th>
            <th className="px-3 py-2 font-medium">
              {t('balance.ledger.columns.resultingBalance')}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((row): React.ReactElement => (
            <tr key={row.id} className="border-t border-border">
              <td className="px-3 py-2 text-text-secondary whitespace-nowrap">
                {formatDateTime(row.createdAt)}
              </td>
              <td className="px-3 py-2 text-text-primary">
                {t(`balance.ledger.types.${row.type}`)}
              </td>
              <td className="px-3 py-2 font-medium text-text-primary tabular-nums">
                {row.amount}
              </td>
              <td className="px-3 py-2 text-text-secondary">{row.reason}</td>
              <td className="px-3 py-2 font-medium text-text-primary tabular-nums">
                {row.resultingBalance}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
