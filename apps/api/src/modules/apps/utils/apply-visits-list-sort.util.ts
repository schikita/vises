import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import type {
  VisitsListSortDir,
  VisitsListSortKey,
} from '../types/visits-list-query.types';

/** Apply visits list ORDER BY; default visit_date ASC when sort omitted. */
export const applyVisitsListSort = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  sort: VisitsListSortKey | null,
  sortDir: VisitsListSortDir,
  alias = 'a',
): SelectQueryBuilder<T> => {
  if (!sort) {
    return qb.orderBy(`${alias}.visit_date`, 'ASC');
  }

  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';

  switch (sort) {
    case 'applicant':
      qb.addSelect(
        `LOWER(COALESCE(NULLIF(TRIM(CONCAT(COALESCE(${alias}.applicants->0->>'firstName', ''), ' ', COALESCE(${alias}.applicants->0->>'lastName', ''))), ''), ${alias}.code))`,
        'visits_sort_applicant',
      );
      return qb.orderBy('visits_sort_applicant', dir);
    case 'city':
      return qb.orderBy(`LOWER(${alias}.submit_city)`, dir);
    case 'date':
      return qb.orderBy(`${alias}.visit_date`, dir);
    case 'time':
      return qb.orderBy(`${alias}.visit_time`, dir);
    case 'place':
      return qb.orderBy(`LOWER(${alias}.visit_place)`, dir);
    case 'status':
      return qb.orderBy(`LOWER(${alias}.status)`, dir);
    default:
      return qb.orderBy(`${alias}.visit_date`, 'ASC');
  }
};
