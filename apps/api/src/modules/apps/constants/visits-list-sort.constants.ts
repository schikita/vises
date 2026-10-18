import type { VisitsListSortKey } from '../types/visits-list-query.types';

export const VISITS_LIST_SORT_KEYS: readonly VisitsListSortKey[] = [
  'applicant',
  'city',
  'date',
  'time',
  'place',
  'status',
] as const;
