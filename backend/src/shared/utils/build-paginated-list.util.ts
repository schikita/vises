import type { PaginatedList } from '../types/paginated-list.types';

/** Build the shared offset pagination envelope (DEC-003). */
export const buildPaginatedList = <T>(input: {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}): PaginatedList<T> => ({
  items: input.items,
  total: input.total,
  page: input.page,
  pageSize: input.pageSize,
});
