import type { PortalFrame, PortalPage } from './patchright-surface.types';

/**
 * Top document or iframe evaluate surface (Edit Member form lives in
 * `iframe.k-content-frame` after Proceed).
 */
export type PortalDomContext = PortalPage | PortalFrame;
