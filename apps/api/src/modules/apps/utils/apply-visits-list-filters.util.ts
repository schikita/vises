import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/**
 * Apply visits city + search filters. Search covers app fields and joined user
 * (`u`) name/email/login when present (parity with `matchVisitsSearch`).
 */
export const applyVisitsListFilters = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  filters: { q: string; city: string },
  alias = 'a',
  userAlias = 'u',
): SelectQueryBuilder<T> => {
  if (filters.city && filters.city !== 'all') {
    qb.andWhere(`${alias}.submit_city = :city`, { city: filters.city });
  }
  if (filters.q) {
    const q = `%${filters.q.toLowerCase()}%`;
    qb.andWhere(
      `(
        LOWER(${alias}.code) LIKE :q
        OR LOWER(${alias}.client_email) LIKE :q
        OR LOWER(COALESCE(${userAlias}.name, '')) LIKE :q
        OR LOWER(COALESCE(${userAlias}.email, '')) LIKE :q
        OR LOWER(COALESCE(${userAlias}.login, '')) LIKE :q
      )`,
      { q },
    );
  }
  return qb;
};
