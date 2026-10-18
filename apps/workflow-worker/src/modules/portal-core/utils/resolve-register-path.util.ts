import { DEFAULT_REGISTER_PATH } from '../constants';

/**
 * Absent/undefined → DEFAULT_REGISTER_PATH;
 * present trim '' or '/' → '/'; otherwise trimmed path.
 */
export const resolveRegisterPath = (raw: string | undefined): string => {
  if (raw === undefined) {
    return DEFAULT_REGISTER_PATH;
  }
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === '/') {
    return '/';
  }
  return trimmed;
};
