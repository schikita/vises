import { resolve } from 'node:path';

/**
 * Absolute path to `backend/.env` (Nest package root).
 * Resolved from this file's location so cwd does not matter.
 */
export const resolveBackendEnvPath = (): string =>
  resolve(__dirname, '../../../../.env');
