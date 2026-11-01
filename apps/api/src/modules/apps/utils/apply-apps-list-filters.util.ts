import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/**
 * Apply apps list text/status/city filters (parity with Applications.tsx).
 * `status`/`city` of `all` or empty are ignored.
 */
export const applyAppsListFilters = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  filters: { q: string; status: string; city: string },
  alias = 'a',
): SelectQueryBuilder<T> => {
  if (filters.status && filters.status !== 'all') {
    qb.andWhere(`${alias}.status = :status`, { status: filters.status });
  }
  if (filters.city && filters.city !== 'all') {
    qb.andWhere(`${alias}.submit_city = :city`, { city: filters.city });
  }
  if (filters.q) {
    const q = `%${filters.q.toLowerCase()}%`;
    qb.andWhere(
      `(
        LOWER(${alias}.code) LIKE :q
        OR LOWER(${alias}.destination) LIKE :q
        OR LOWER(${alias}.submit_city) LIKE :q
        OR LOWER(${alias}.client_email) LIKE :q
      )`,
      { q },
    );
  }
  return qb;
};
