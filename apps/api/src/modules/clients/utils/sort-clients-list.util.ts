import type {
  ClientListDto,
  ClientsListSortBy,
  ClientsListSortDir,
} from '@vises/contracts';

const compareLocale = (a: string, b: string): number => a.localeCompare(b);

const routeKey = (row: ClientListDto): string =>
  `${row.routeFrom ?? ''}\u0000${row.routeTo ?? ''}`;

const compareBySortKey = (
  a: ClientListDto,
  b: ClientListDto,
  sortBy: ClientsListSortBy,
): number => {
  switch (sortBy) {
    case 'firstName':
      return compareLocale(a.firstName, b.firstName);
    case 'agentName':
      return compareLocale(a.agentName, b.agentName);
    case 'route':
      return compareLocale(routeKey(a), routeKey(b));
    case 'status':
      return compareLocale(a.status, b.status);
    case 'createdAt':
    default:
      return compareLocale(a.createdAt, b.createdAt);
  }
};

/**
 * Sort clients list rows (DEC-P3 / DEC-P16).
 * Tie-break by `id`. Direction applies to the primary key.
 */
export const sortClientsList = (
  rows: readonly ClientListDto[],
  sortBy: ClientsListSortBy,
  sortDir: ClientsListSortDir,
): ClientListDto[] => {
  const copy = [...rows];
  const dirMul = sortDir === 'desc' ? -1 : 1;
  copy.sort((a, b): number => {
    const primary = compareBySortKey(a, b, sortBy);
    if (primary !== 0) {
      return primary * dirMul;
    }
    return a.id.localeCompare(b.id);
  });
  return copy;
};
