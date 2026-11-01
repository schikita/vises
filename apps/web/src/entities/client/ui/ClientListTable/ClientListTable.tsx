import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '@/shared/lib'
import { Empty, StatusBadge } from '@/shared/ui'
import type { ClientListTableProps } from '../../types'

/**
 * Decision 2A list rows: `maskedPassport` string only — never plaintext FR-6.
 */
export const ClientListTable = ({
  items,
  detailBasePath,
  emptyTitle,
  emptyText,
}: ClientListTableProps): React.ReactElement => {
  const { t } = useTranslation()

  if (items.length === 0) {
    return <Empty title={emptyTitle} text={emptyText} />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-surface-muted text-text-secondary">
          <tr>
            <th className="px-3 py-2 font-medium">{t('clients.list.columns.name')}</th>
            <th className="px-3 py-2 font-medium">
              {t('clients.list.columns.maskedPassport')}
            </th>
            <th className="px-3 py-2 font-medium">{t('clients.list.columns.status')}</th>
            <th className="px-3 py-2 font-medium">{t('clients.list.columns.createdAt')}</th>
            <th className="px-3 py-2 font-medium">
              <span className="sr-only">{t('clients.list.columns.open')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map(
            (row): React.ReactElement => {
              const displayName =
                [row.firstName, row.lastName].filter(Boolean).join(' ').trim() ||
                t('clients.list.unnamed')
              return (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium text-text-primary">
                    {displayName}
                  </td>
                  <td className="px-3 py-2 font-mono text-text-secondary tabular-nums">
                    {row.maskedPassport}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge
                      status={row.status}
                      label={t(`clients.status.${row.status}`)}
                    />
                  </td>
                  <td className="px-3 py-2 text-text-secondary whitespace-nowrap">
                    {formatDateTime(row.createdAt)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      to={`${detailBasePath}/${row.id}`}
                      className="text-sm font-medium text-forest no-underline hover:underline"
                    >
                      {t('clients.list.open')}
                    </Link>
                  </td>
                </tr>
              )
            },
          )}
        </tbody>
      </table>
    </div>
  )
}
