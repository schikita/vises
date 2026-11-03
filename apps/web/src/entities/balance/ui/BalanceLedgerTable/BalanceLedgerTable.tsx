import { useTranslation } from 'react-i18next'
import type { BalanceTransactionDto } from '@vises/contracts'
import { formatDateTime } from '@/shared/lib'
import { DataTable, type DataTableColumnDef } from '@/shared/ui'
import type { BalanceLedgerTableProps } from '../../types'

/** Newest-first ledger table; amounts rendered as API decimal strings. */
export const BalanceLedgerTable = ({
  items,
  emptyTitle,
  emptyText,
}: BalanceLedgerTableProps): React.ReactElement => {
  const { t } = useTranslation()

  const columns: DataTableColumnDef<BalanceTransactionDto>[] = [
    {
      id: 'createdAt',
      header: t('balance.ledger.columns.createdAt'),
      cell: (row): React.ReactNode => (
        <span className="whitespace-nowrap text-text-secondary">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      id: 'type',
      header: t('balance.ledger.columns.type'),
      cell: (row): React.ReactNode => (
        <span className="text-text-primary">
          {t(`balance.ledger.types.${row.type}`)}
        </span>
      ),
    },
    {
      id: 'amount',
      header: t('balance.ledger.columns.amount'),
      cell: (row): React.ReactNode => (
        <span className="font-medium tabular-nums text-text-primary">
          {row.amount}
        </span>
      ),
    },
    {
      id: 'reason',
      header: t('balance.ledger.columns.reason'),
      cell: (row): React.ReactNode => (
        <span className="text-text-secondary">{row.reason}</span>
      ),
    },
    {
      id: 'resultingBalance',
      header: t('balance.ledger.columns.resultingBalance'),
      cell: (row): React.ReactNode => (
        <span className="font-medium tabular-nums text-text-primary">
          {row.resultingBalance}
        </span>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={items}
      getRowId={(row): string => row.id}
      emptyTitle={emptyTitle}
      emptyText={emptyText}
    />
  )
}
