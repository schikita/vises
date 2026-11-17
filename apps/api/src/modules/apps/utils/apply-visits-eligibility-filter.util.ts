import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { VISIT_ELIGIBLE_STATUSES } from '../constants/visits-eligibility.constants';

/**
 * Restrict to visit-eligible apps: non-empty visitDate OR status `booked`
 * (parity with `isVisitEligibleApp`, REQ-008; BUSINESS / DEC-TERMINAL).
 */
export const applyVisitsEligibilityFilter = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias = 'a',
): SelectQueryBuilder<T> => {
  qb.andWhere(
    `(
      (NULLIF(TRIM(${alias}.visit_date), '') IS NOT NULL)
      OR ${alias}.status IN (:...visitEligibleStatuses)
    )`,
    { visitEligibleStatuses: [...VISIT_ELIGIBLE_STATUSES] },
  );
  return qb;
};
