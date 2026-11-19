import type { ClientListDto } from '@vises/contracts'

/** Slice clients list for ListPager. */
export const sliceClientsListPage = (
  rows: ClientListDto[],
  page: number,
  pageSize: number,
): ClientListDto[] => {
  const start = (page - 1) * pageSize
  return rows.slice(start, start + pageSize)
}
