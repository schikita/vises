import { existsSync } from 'node:fs';
import { config as loadDotenv } from 'dotenv';
import { resolveBackendEnvPath } from './utils/resolve-backend-env-path.util';

/**
 * Load `backend/.env` only (no repo-root fallback).
 *
 * Existing `process.env` (including Compose `env_file`) is never overridden.
 * Nest ConfigModule also points at the same path; ConfigService is the
 * application read path after boot.
 */
export const loadLocalEnv = (): void => {
  const path = resolveBackendEnvPath();
  if (!existsSync(path)) return;
  loadDotenv({ path, override: false });
};

loadLocalEnv();
