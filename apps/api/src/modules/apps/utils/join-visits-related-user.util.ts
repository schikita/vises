import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/**
 * Left-join related user matched by application `client_email` ≈ user email/login
 * (visits search parity with `matchVisitsSearch`).
 */
export const joinVisitsRelatedUser = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias = 'a',
  userAlias = 'u',
): SelectQueryBuilder<T> => {
  qb.leftJoin(
    'users',
    userAlias,
    `(
      (NULLIF(TRIM(${userAlias}.email), '') IS NOT NULL
        AND LOWER(TRIM(${userAlias}.email)) = LOWER(TRIM(${alias}.client_email)))
      OR (NULLIF(TRIM(${userAlias}.login), '') IS NOT NULL
        AND LOWER(TRIM(${userAlias}.login)) = LOWER(TRIM(${alias}.client_email)))
    )`,
  );
  return qb;
};
