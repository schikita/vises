import { INSECURE_DEFAULT_SECRET } from '../constants';

/** DEC-007: refuse insecure JWT secret when NODE_ENV=production. */
export const resolveJwtSecret = (
  jwtSecret: string | undefined,
  nodeEnv: string,
): string => {
  const raw = jwtSecret?.trim() ?? '';
  const secret = raw || INSECURE_DEFAULT_SECRET;

  if (nodeEnv === 'production') {
    if (!raw || raw === INSECURE_DEFAULT_SECRET) {
      throw new Error(
        'JWT_SECRET must be set to a non-default value when NODE_ENV=production ' +
          `(do not use "${INSECURE_DEFAULT_SECRET}"). Set JWT_SECRET in the environment.`,
      );
    }
  }

  return secret;
};
