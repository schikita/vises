import {
  DATA_TABLE_CLASS,
  DATA_TABLE_EMPTY_CELL_CLASS,
  DATA_TABLE_EMPTY_TEXT_DEFAULT,
  DATA_TABLE_EMPTY_TITLE_DEFAULT,
  DATA_TABLE_TD_CLASS,
  DATA_TABLE_TH_CLASS,
  DATA_TABLE_THEAD_CLASS,
  DATA_TABLE_TR_CLASS,
  DATA_TABLE_TR_INTERACTIVE_CLASS,
  DATA_TABLE_WRAPPER_CLASS,
} from './data-table.constants'
import type { DataTableProps } from './data-table.types'
import { DataTableEmpty } from './DataTableEmpty'
import { resolveDataTableCell } from './resolve-data-table-cell.util'
import { resolveDataTableRowId } from './resolve-data-table-row-id.util'

export const DataTable = <TRow,>(
  props: DataTableProps<TRow>,
): React.ReactElement => {
  const {
    columns,
    data,
    getRowId,
    onRowClick,
    emptyTitle = DATA_TABLE_EMPTY_TITLE_DEFAULT,
    emptyText = DATA_TABLE_EMPTY_TEXT_DEFAULT,
    className = '',
    tableClassName = '',
  } = props

  const isInteractive = onRowClick !== undefined
  const wrapperClassName = `${DATA_TABLE_WRAPPER_CLASS} ${className}`.trim()
  const tableClassNameMerged = `${DATA_TABLE_CLASS} ${tableClassName}`.trim()
  const rowClassName = isInteractive
    ? `${DATA_TABLE_TR_CLASS} ${DATA_TABLE_TR_INTERACTIVE_CLASS}`
    : DATA_TABLE_TR_CLASS

  return (
    <div className={wrapperClassName}>
      <table className={tableClassNameMerged}>
        <thead className={DATA_TABLE_THEAD_CLASS}>
          <tr>
            {columns.map(
              (column): React.ReactElement => (
                <th
                  key={column.id}
                  className={`${DATA_TABLE_TH_CLASS} ${column.headerClassName ?? ''}`.trim()}
                >
                  {column.header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                className={DATA_TABLE_EMPTY_CELL_CLASS}
                colSpan={Math.max(columns.length, 1)}
              >
                <DataTableEmpty title={emptyTitle} text={emptyText} />
              </td>
            </tr>
          ) : (
            data.map(
              (row, index): React.ReactElement => {
                const rowId = resolveDataTableRowId(row, index, getRowId)
                return (
                  <tr
                    key={rowId}
                    className={rowClassName}
                    role={isInteractive ? 'link' : undefined}
                    tabIndex={isInteractive ? 0 : undefined}
                    onClick={
                      isInteractive
                        ? (): void => {
                            onRowClick(row)
                          }
                        : undefined
                    }
                    onKeyDown={
                      isInteractive
                        ? (event): void => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              onRowClick(row)
                            }
                          }
                        : undefined
                    }
                  >
                    {columns.map(
                      (column): React.ReactElement => (
                        <td
                          key={`${rowId}-${column.id}`}
                          className={`${DATA_TABLE_TD_CLASS} ${column.className ?? ''}`.trim()}
                        >
                          {resolveDataTableCell(column, row)}
                        </td>
                      ),
                    )}
                  </tr>
                )
              },
            )
          )}
        </tbody>
      </table>
    </div>
  )
}
