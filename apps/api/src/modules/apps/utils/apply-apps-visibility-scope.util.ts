import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import type { User } from '../../database/entities/user.entity';

/** Scope applications query to the caller's visible rows (client vs staff). */
export const applyAppsVisibilityScope = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  user: User,
  alias = 'a',
): SelectQueryBuilder<T> => {
  if (user.role === 'client') {
    qb.andWhere(
      `(${alias}.client_email = :email OR ${alias}.client_email = :login)`,
      { email: user.email, login: user.login },
    );
  }
  return qb;
};
