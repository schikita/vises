/** Page count for offset pagination; empty sets still yield 1. */
export const staffListPageCount = (total: number, pageSize: number): number => {
  if (total <= 0 || pageSize <= 0) return 1
  return Math.max(1, Math.ceil(total / pageSize))
}
