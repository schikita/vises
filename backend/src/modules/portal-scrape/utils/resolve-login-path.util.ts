import { DEFAULT_LOGIN_PATH } from '../constants';

/**
 * Absent/undefined → DEFAULT_LOGIN_PATH;
 * present → trimmed (may be empty — fail closed at resolvePortalLoginUrl, DEC-009).
 */
export const resolveLoginPath = (raw: string | undefined): string => {
  if (raw === undefined) {
    return DEFAULT_LOGIN_PATH;
  }
  return raw.trim();
};
