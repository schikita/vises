import type { AppsUpsertArmResponse } from '@vises/contracts';
import type { IssuedClientAccess } from './upsert-app-result.types';
import type { AppOutWithPortalProgress } from './app-out-with-portal-progress.types';

/**
 * Upsert HTTP body: normative AppsUpsertArmResponse plus cutover fields so the
 * SPA can keep caching the application / issued client access (residual until
 * pure envelope cutover completes).
 */
export type AppsUpsertHttpResponse = AppsUpsertArmResponse & {
  application: AppOutWithPortalProgress;
  issuedClientAccess?: IssuedClientAccess;
};
