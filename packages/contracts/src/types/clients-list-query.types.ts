import type { ClientsListSortBy } from './clients-list-sort-by.types';
import type { ClientsListSortDir } from './clients-list-sort-dir.types';

/**
 * Query for `GET /clients` (qa-polish DEC-P3 / DEC-P16).
 * `search` matches name and masked/raw passport fields available without
 * decrypting PII beyond the existing list mask.
 */
export type ClientsListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: ClientsListSortBy;
  sortDir?: ClientsListSortDir;
};
