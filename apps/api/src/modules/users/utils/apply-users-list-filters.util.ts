import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/**
 * Apply users list role + text filters (parity with Users.tsx:
 * name/login/email search).
 */
export const applyUsersListFilters = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  filters: { q: string; role: string },
  alias = 'u',
): SelectQueryBuilder<T> => {
  if (filters.role && filters.role !== 'all') {
    qb.andWhere(`${alias}.role = :role`, { role: filters.role });
  }
  if (filters.q) {
    const q = `%${filters.q.toLowerCase()}%`;
    qb.andWhere(
      `(
        LOWER(${alias}.name) LIKE :q
        OR LOWER(${alias}.login) LIKE :q
        OR LOWER(${alias}.email) LIKE :q
      )`,
      { q },
    );
  }
  return qb;
};
