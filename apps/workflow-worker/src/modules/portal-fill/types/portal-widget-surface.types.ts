import type { PortalPage } from './patchright-surface.types';

/**
 * Minimal Patchright surface for shared Kendo/text helpers.
 * Satisfied by `PortalPage` and by Edit Member iframe frames that expose
 * `evaluate` + `locator` (Playwright/Patchright Frame API).
 */
export type PortalWidgetSurface = Pick<PortalPage, 'evaluate' | 'locator'>;
