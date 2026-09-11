import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';

/**
 * Load repo-root / local `.env` for host Nest (`npm run start:dev`).
 *
 * - Does not override existing `process.env` (Docker Compose `env_file` /
 *   `environment` always win).
 * - Missing files are ignored (API image has no `.env` on disk).
 */
export const loadLocalEnv = (): void => {
  const candidates = [
    // `cd backend && npm run start:dev` → repo root `.env`
    resolve(process.cwd(), '../.env'),
    // cwd already repo root, or optional `backend/.env`
    resolve(process.cwd(), '.env'),
  ];

  const seen = new Set<string>();
  for (const path of candidates) {
    if (seen.has(path) || !existsSync(path)) continue;
    seen.add(path);
    loadDotenv({ path, override: false });
  }
};

loadLocalEnv();
