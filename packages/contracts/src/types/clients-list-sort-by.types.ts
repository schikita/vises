/**
 * Allowlisted `sortBy` values for `GET /clients` (qa-polish DEC-P3 / DEC-P16).
 */
export type ClientsListSortBy =
  | 'createdAt'
  | 'firstName'
  | 'agentName'
  | 'route'
  | 'status';
