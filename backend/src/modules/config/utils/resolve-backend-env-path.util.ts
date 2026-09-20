import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolveEnvFileSuffix } from './resolve-env-file-suffix.util';

/**
 * Absolute path to the backend env file (Nest package root).
 * Prefers `backend/.env.dev` or `backend/.env.prod` from NODE_ENV, else `.env`.
 * Resolved from this file's location so cwd does not matter.
 */
export const resolveBackendEnvPath = (): string => {
  const backendRoot = resolve(__dirname, '../../../..');
  const suffix = resolveEnvFileSuffix(process.env.NODE_ENV);
  if (suffix) {
    const envSpecific = resolve(backendRoot, `.env.${suffix}`);
    if (existsSync(envSpecific)) {
      return envSpecific;
    }
  }
  return resolve(backendRoot, '.env');
};
