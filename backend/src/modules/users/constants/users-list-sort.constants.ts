import type { UsersListSortKey } from '../types/users-list-query.types';

export const USERS_LIST_SORT_KEYS: readonly UsersListSortKey[] = [
  'user',
  'role',
  'status',
  'created',
] as const;
