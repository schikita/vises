import { resolveBackendEnvPath } from './resolve-backend-env-path.util';

/**
 * Sibling host-override file for the resolved env path
 * (e.g. `.env.dev` → `.env.dev.local`). Optional; gitignored.
 */
export const resolveBackendEnvLocalPath = (): string =>
  `${resolveBackendEnvPath()}.local`;
