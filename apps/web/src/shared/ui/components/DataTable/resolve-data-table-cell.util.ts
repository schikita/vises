import type { ReactNode } from 'react'
import type { DataTableColumnDef } from './data-table.types'

export const resolveDataTableCell = <TRow,>(
  column: DataTableColumnDef<TRow>,
  row: TRow,
): ReactNode => {
  if (column.cell) {
    return column.cell(row)
  }

  if (column.accessorKey === undefined) {
    return null
  }

  const value = row[column.accessorKey]
  if (value === null || value === undefined) {
    return null
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value)
  }

  return null
}
