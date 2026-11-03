import type {
  ClientsListSortBy,
  ClientsListSortDir,
} from '@vises/contracts';

/** Allowlisted `sortBy` values for `GET /clients` (qa-polish DEC-P3 / DEC-P16). */
export const CLIENTS_LIST_SORT_KEYS = [
  'createdAt',
  'firstName',
  'agentName',
  'route',
  'status',
] as const satisfies readonly ClientsListSortBy[];

export const DEFAULT_CLIENTS_LIST_SORT_BY: ClientsListSortBy = 'createdAt';

/** Default when omitted: newest-first for default `createdAt` (DEC-P16). */
export const DEFAULT_CLIENTS_LIST_SORT_DIR: ClientsListSortDir = 'desc';
