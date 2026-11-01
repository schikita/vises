import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import type {
  AppsListSortDir,
  AppsListSortKey,
} from '../types/apps-list-query.types';

/**
 * Apply apps list ORDER BY. When `sort` is null, defaults to `created_at DESC`
 * (DEC apps list).
 */
export const applyAppsListSort = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  sort: AppsListSortKey | null,
  sortDir: AppsListSortDir,
  alias = 'a',
): SelectQueryBuilder<T> => {
  if (!sort) {
    return qb.orderBy(`${alias}.created_at`, 'DESC');
  }

  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';

  switch (sort) {
    case 'name':
      // T2: applicants jsonb removed; sort by code until Client join lands (T8/T9).
      return qb.orderBy(`LOWER(${alias}.code)`, dir);
    case 'category':
      qb.addSelect(
        `LOWER(COALESCE(NULLIF(${alias}.extras->>'category', ''), ${alias}.visa_type, ''))`,
        'apps_sort_category',
      );
      return qb.orderBy('apps_sort_category', dir);
    case 'city':
      return qb.orderBy(`LOWER(${alias}.submit_city)`, dir);
    case 'status':
      return qb.orderBy(`LOWER(${alias}.status)`, dir);
    case 'travelDate':
      return qb.orderBy(`${alias}.travel_date`, dir);
    default:
      return qb.orderBy(`${alias}.created_at`, 'DESC');
  }
};
