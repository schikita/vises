import type { PortalSiteAdapterMatchContext } from '../types';
import type { IPortalSiteAdapter } from './portal-site-adapter.interface';

/** Ordered site-adapter registry (DEC-009). Fail closed when no match. */
export interface IPortalSiteAdapterRegistry {
  resolve(ctx: PortalSiteAdapterMatchContext): IPortalSiteAdapter | null;
}
