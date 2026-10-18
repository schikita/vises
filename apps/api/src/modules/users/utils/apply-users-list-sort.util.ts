import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { USER_ROLE_SORT_LABEL } from '../constants/user-role-sort-label.constants';
import type {
  UsersListSortDir,
  UsersListSortKey,
} from '../types/users-list-query.types';

/** Apply users list ORDER BY; default created_at DESC when sort omitted. */
export const applyUsersListSort = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  sort: UsersListSortKey | null,
  sortDir: UsersListSortDir,
  alias = 'u',
): SelectQueryBuilder<T> => {
  if (!sort) {
    return qb.orderBy(`${alias}.created_at`, 'DESC');
  }

  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';

  switch (sort) {
    case 'user':
      qb.addSelect(
        `LOWER(COALESCE(NULLIF(TRIM(${alias}.name), ''), ${alias}.login))`,
        'users_sort_user',
      );
      return qb.orderBy('users_sort_user', dir);
    case 'role': {
      const adminLabel = USER_ROLE_SORT_LABEL.admin;
      const managerLabel = USER_ROLE_SORT_LABEL.manager;
      const clientLabel = USER_ROLE_SORT_LABEL.client;
      qb.addSelect(
        `LOWER(CASE ${alias}.role
          WHEN 'admin' THEN :adminLabel
          WHEN 'manager' THEN :managerLabel
          WHEN 'client' THEN :clientLabel
          ELSE ${alias}.role
        END)`,
        'users_sort_role',
      );
      qb.setParameter('adminLabel', adminLabel);
      qb.setParameter('managerLabel', managerLabel);
      qb.setParameter('clientLabel', clientLabel);
      return qb.orderBy('users_sort_role', dir);
    }
    case 'status':
      return qb.orderBy(
        `CASE WHEN ${alias}.active THEN '1' ELSE '0' END`,
        dir,
      );
    case 'created':
      return qb.orderBy(`${alias}.created_at`, dir);
    default:
      return qb.orderBy(`${alias}.created_at`, 'DESC');
  }
};
