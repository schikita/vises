import { useTranslation } from 'react-i18next'
import type { ClientListDto } from '@vises/contracts'
import { formatDateTime } from '@/shared/lib'
import { DataTable, StatusBadge, type DataTableColumnDef } from '@/shared/ui'
import { CLIENT_LIST_SORT_COLUMNS } from '../../constants/client-list-sort-columns.constants'
import type { ClientListTableProps } from '../../types'
import { ClientListSortIcon } from '../ClientListSortIcon'
import { ClientRouteDisplay } from '../ClientRouteDisplay'

/**
 * DEC-P8 / DEC-P11 / DEC-P16 list rows: agentName + route arrow, sortable columns.
 * Entire row is clickable.
 */
export const ClientListTable = ({
  items,
  emptyTitle,
  emptyText,
  showAgentColumn,
  sortBy,
  sortDir,
  onSortChange,
  onRowActivate,
}: ClientListTableProps): React.ReactElement => {
  const { t } = useTranslation()

  const sortColumns = CLIENT_LIST_SORT_COLUMNS.filter(
    (col): boolean => !col.requiresAgentColumn || showAgentColumn,
  )

  const columns: DataTableColumnDef<ClientListDto>[] = sortColumns.map(
    (col): DataTableColumnDef<ClientListDto> => ({
      id: col.key,
      header: (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-left uppercase tracking-wide hover:text-text-primary"
          onClick={(): void => onSortChange(col.key)}
        >
          {t(col.labelKey)}
          <ClientListSortIcon active={sortBy === col.key} dir={sortDir} />
        </button>
      ),
      cell: (row): React.ReactNode => {
        if (col.key === 'firstName') {
          const displayName =
            [row.firstName, row.lastName].filter(Boolean).join(' ').trim() ||
            t('clients.list.unnamed')
          return (
            <span className="font-medium text-text-primary">{displayName}</span>
          )
        }
        if (col.key === 'agentName') {
          return <span className="text-text-secondary">{row.agentName}</span>
        }
        if (col.key === 'route') {
          return (
            <ClientRouteDisplay
              routeFrom={row.routeFrom}
              routeTo={row.routeTo}
            />
          )
        }
        if (col.key === 'status') {
          return (
            <StatusBadge
              status={row.status}
              label={t(`clients.status.${row.status}`)}
            />
          )
        }
        return (
          <span className="whitespace-nowrap text-text-secondary">
            {formatDateTime(row.createdAt)}
          </span>
        )
      },
    }),
  )

  return (
    <DataTable
      columns={columns}
      data={items}
      getRowId={(row): string => row.id}
      onRowClick={(row): void => {
        onRowActivate(row.id)
      }}
      emptyTitle={emptyTitle}
      emptyText={emptyText}
    />
  )
}
