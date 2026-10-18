import type { AppsListSortKey } from '../types/apps-list-query.types';

export const APPS_LIST_SORT_KEYS: readonly AppsListSortKey[] = [
  'name',
  'category',
  'city',
  'status',
  'travelDate',
] as const;
