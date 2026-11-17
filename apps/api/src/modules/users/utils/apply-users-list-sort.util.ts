import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { USER_ROLE_SORT_LABEL } from '../constants/user-role-sort-label.constants';
import type {
  UsersListSortDir,
  UsersListSortKey,
} from '../types/users-list-query.types';

/** Apply users list ORDER BY; default createdAt DESC when sort omitted. */
export const applyUsersListSort = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  sort: UsersListSortKey | null,
  sortDir: UsersListSortDir,
  alias = 'u',
): SelectQueryBuilder<T> => {
  if (!sort) {
    return qb
      .orderBy(`${alias}.createdAt`, 'DESC')
      .addOrderBy(`${alias}.id`, 'DESC');
  }

  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';

  switch (sort) {
    case 'user':
    case 'name':
      qb.addSelect(
        `LOWER(COALESCE(NULLIF(TRIM(${alias}.name), ''), ${alias}.login))`,
        'users_sort_user',
      );
      return qb.orderBy('users_sort_user', dir).addOrderBy(`${alias}.id`, dir);
    case 'role': {
      const superadminLabel = USER_ROLE_SORT_LABEL.superadmin;
      const adminLabel = USER_ROLE_SORT_LABEL.admin;
      const agentLabel = USER_ROLE_SORT_LABEL.agent;
      qb.addSelect(
        `LOWER(CASE ${alias}.role
          WHEN 'superadmin' THEN :superadminLabel
          WHEN 'admin' THEN :adminLabel
          WHEN 'agent' THEN :agentLabel
          ELSE ${alias}.role
        END)`,
        'users_sort_role',
      );
      qb.setParameter('superadminLabel', superadminLabel);
      qb.setParameter('adminLabel', adminLabel);
      qb.setParameter('agentLabel', agentLabel);
      return qb.orderBy('users_sort_role', dir).addOrderBy(`${alias}.id`, dir);
    }
    case 'status':
      return qb
        .orderBy(
          `CASE WHEN ${alias}.active THEN '1' ELSE '0' END`,
          dir,
        )
        .addOrderBy(`${alias}.id`, dir);
    case 'created':
      return qb
        .orderBy(`${alias}.createdAt`, dir)
        .addOrderBy(`${alias}.id`, dir);
    case 'currentBalance':
      return qb
        .orderBy(`COALESCE(CAST(${alias}.balance AS numeric), 0)`, dir)
        .addOrderBy(`${alias}.id`, dir);
    case 'clientsCount':
      qb.addSelect(
        `(SELECT COUNT(*)::int FROM clients c WHERE c.agent_id = ${alias}.id)`,
        'users_sort_clients_count',
      );
      return qb
        .orderBy('users_sort_clients_count', dir)
        .addOrderBy(`${alias}.id`, dir);
    case 'totalRevenue':
      qb.addSelect(
        `(SELECT COALESCE(SUM(ABS(bt.amount)), 0) FROM balance_transactions bt WHERE bt.agent_id = ${alias}.id AND bt.type = 'client_creation_debit')`,
        'users_sort_total_revenue',
      );
      return qb
        .orderBy('users_sort_total_revenue', dir)
        .addOrderBy(`${alias}.id`, dir);
    default:
      return qb
        .orderBy(`${alias}.createdAt`, 'DESC')
        .addOrderBy(`${alias}.id`, 'DESC');
  }
};
