import { randomBytes } from 'crypto';

/** Parity with Python `uid(prefix)` → `{prefix}-{8 hex chars}`. */
export const uid = (prefix: string): string =>
  `${prefix}-${randomBytes(4).toString('hex')}`;
