import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import type { VisitsFilterMode } from '../types/visits-list-query.types';

/**
 * Apply upcoming/all mode (parity with `isUpcomingVisit` when mode=upcoming).
 */
export const applyVisitsModeFilter = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  mode: VisitsFilterMode,
  todayIsoDate: string,
  alias = 'a',
): SelectQueryBuilder<T> => {
  if (mode !== 'upcoming') {
    return qb;
  }
  qb.andWhere(
    `(
      NULLIF(TRIM(${alias}.visit_date), '') IS NOT NULL
      AND ${alias}.visit_date >= :todayIsoDate
      AND ${alias}.status <> 'done'
    )`,
    { todayIsoDate },
  );
  return qb;
};
