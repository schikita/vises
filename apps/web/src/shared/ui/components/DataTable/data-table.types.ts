import type { ReactNode } from 'react'

export type DataTableColumnDef<TRow> = {
  id: string
  header: ReactNode
  accessorKey?: keyof TRow & string
  cell?: (row: TRow) => ReactNode
  className?: string
  headerClassName?: string
}

export type DataTableProps<TRow> = {
  columns: DataTableColumnDef<TRow>[]
  data: TRow[]
  getRowId?: (row: TRow, index: number) => string
  onRowClick?: (row: TRow) => void
  emptyTitle?: string
  emptyText?: string
  className?: string
  tableClassName?: string
}
