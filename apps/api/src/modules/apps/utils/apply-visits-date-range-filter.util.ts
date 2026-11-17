import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/**
 * Inclusive visit_date range filter (`YYYY-MM-DD` string compare).
 * When either bound is set, requires a non-empty visit_date.
 */
export const applyVisitsDateRangeFilter = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  from: string | null,
  to: string | null,
  alias = 'a',
): SelectQueryBuilder<T> => {
  if (from === null && to === null) {
    return qb;
  }

  qb.andWhere(`NULLIF(TRIM(${alias}.visit_date), '') IS NOT NULL`);

  if (from !== null) {
    qb.andWhere(`${alias}.visit_date >= :visitDateFrom`, {
      visitDateFrom: from,
    });
  }
  if (to !== null) {
    qb.andWhere(`${alias}.visit_date <= :visitDateTo`, {
      visitDateTo: to,
    });
  }
  return qb;
};
