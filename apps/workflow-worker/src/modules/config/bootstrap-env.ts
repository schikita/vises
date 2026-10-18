import { existsSync } from 'node:fs';
import { config as loadDotenv } from 'dotenv';
import { resolveBackendEnvLocalPath } from './utils/resolve-backend-env-local-path.util';
import { resolveBackendEnvPath } from './utils/resolve-backend-env-path.util';

/**
 * Load `backend/.env.dev` or `backend/.env.prod` when present for the
 * current NODE_ENV, else `backend/.env` (no repo-root fallback).
 *
 * Then optionally load the sibling `*.local` file (e.g. `.env.dev.local`)
 * with override so host Nest can keep Docker values in `.env.dev` and only
 * override DB host / paths locally. Compose does not mount `*.local`.
 *
 * Existing `process.env` from Compose `env_file` is not overridden by the
 * primary file (`override: false`). The optional `*.local` file does override
 * for host-only keys — do not put `*.local` into images or Compose mounts.
 * Nest ConfigModule also points at the primary path; ConfigService is the
 * application read path after boot.
 */
export const loadLocalEnv = (): void => {
  const path = resolveBackendEnvPath();
  if (existsSync(path)) {
    loadDotenv({ path, override: false });
  }

  const localPath = resolveBackendEnvLocalPath();
  if (existsSync(localPath)) {
    loadDotenv({ path: localPath, override: true });
  }
};

loadLocalEnv();
