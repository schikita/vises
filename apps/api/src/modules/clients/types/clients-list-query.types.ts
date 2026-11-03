import type {
  ClientsListSortBy,
  ClientsListSortDir,
} from '@vises/contracts';

/** Normalized query for paginated `GET /clients` (DEC-P3 / DEC-P16). */
export type ClientsListQueryParsed = {
  page: number;
  pageSize: number;
  search: string;
  sortBy: ClientsListSortBy;
  sortDir: ClientsListSortDir;
};
