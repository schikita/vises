import type { ClientListDto, ClientsListDto } from '@vises/contracts';
import { buildPaginatedList } from '../../../shared/utils';

/** Slice mapped clients into the shared paginated envelope (DEC-P1 / DEC-P3). */
export const paginateClientsList = (input: {
  rows: readonly ClientListDto[];
  page: number;
  pageSize: number;
}): ClientsListDto => {
  const start = (input.page - 1) * input.pageSize;
  const items = input.rows.slice(start, start + input.pageSize);
  return buildPaginatedList({
    items,
    total: input.rows.length,
    page: input.page,
    pageSize: input.pageSize,
  });
};
