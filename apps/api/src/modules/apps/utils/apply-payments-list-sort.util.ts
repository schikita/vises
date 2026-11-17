import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import type {
  PaymentsListSortDir,
  PaymentsListSortKey,
} from '../types/payments-list-query.types';

/** Apply payments list ORDER BY; default createdAt DESC when sort omitted. */
export const applyPaymentsListSort = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  sort: PaymentsListSortKey | null,
  sortDir: PaymentsListSortDir,
  alias = 'a',
): SelectQueryBuilder<T> => {
  if (!sort) {
    return qb
      .orderBy(`${alias}.createdAt`, 'DESC')
      .addOrderBy(`${alias}.id`, 'DESC');
  }

  const dir = sortDir === 'desc' ? 'DESC' : 'ASC';

  switch (sort) {
    case 'app':
      return qb
        .orderBy(`LOWER(${alias}.code)`, dir)
        .addOrderBy(`${alias}.id`, dir);
    case 'amount':
      return qb
        .orderBy(`${alias}.paymentAmount`, dir)
        .addOrderBy(`${alias}.id`, dir);
    case 'status':
      return qb
        .orderBy(
          `CASE WHEN ${alias}.paymentPaid THEN '1' ELSE '0' END`,
          dir,
        )
        .addOrderBy(`${alias}.id`, dir);
    case 'note':
      return qb
        .orderBy(`LOWER(${alias}.paymentNote)`, dir)
        .addOrderBy(`${alias}.id`, dir);
    case 'created':
      return qb
        .orderBy(`${alias}.createdAt`, dir)
        .addOrderBy(`${alias}.id`, dir);
    default:
      return qb
        .orderBy(`${alias}.createdAt`, 'DESC')
        .addOrderBy(`${alias}.id`, 'DESC');
  }
};
