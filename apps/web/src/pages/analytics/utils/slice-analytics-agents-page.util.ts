/**
 * Slice agent performance rows for client-side pagination (REQ-009).
 */
export const sliceAnalyticsAgentsPage = <T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): T[] => {
  const safePage = Math.max(1, page)
  const start = (safePage - 1) * pageSize
  return items.slice(start, start + pageSize)
}
