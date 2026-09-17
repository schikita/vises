/** Insecure fallback when `JWT_SECRET` is unset (dev only). CON-005 / DEC-007. */
export const INSECURE_DEFAULT_SECRET = 'dev-change-me';

/** HS256 token lifetime in hours (parity with Python `auth.py`). */
export const JWT_TTL_HOURS = 24 * 14;
