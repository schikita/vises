import { randomBytes } from 'crypto';

/** Parity with Python `uid(prefix)` → `{prefix}-{8 hex chars}`. */
export function uid(prefix: string): string {
  return `${prefix}-${randomBytes(4).toString('hex')}`;
}
