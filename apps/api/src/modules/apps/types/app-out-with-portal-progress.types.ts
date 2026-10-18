import type { PortalClientPortalProgress } from '../../portal-scrape';
import type { AppOut } from './app-out.types';

/**
 * Application API payload with client-safe portal progress embed (DEC-007 / A-API-1).
 * Additive field — consumers that ignore unknowns remain compatible.
 */
export type AppOutWithPortalProgress = AppOut & {
  portalProgress: PortalClientPortalProgress;
};
