import type { UsersListSortKey } from '../types/users-list-query.types';

export const USERS_LIST_SORT_KEYS: readonly UsersListSortKey[] = [
  'user',
  'name',
  'role',
  'status',
  'created',
  'currentBalance',
  'clientsCount',
  'totalRevenue',
] as const;
