export const resolveDataTableRowId = <TRow,>(
  row: TRow,
  index: number,
  getRowId?: (row: TRow, index: number) => string,
): string => {
  if (getRowId) {
    return getRowId(row, index)
  }

  return String(index)
}
