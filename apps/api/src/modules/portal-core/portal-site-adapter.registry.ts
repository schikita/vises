import { Injectable } from '@nestjs/common';
import { BelarusPortalSiteAdapter } from './belarus-portal-site.adapter';
import type { IPortalSiteAdapterRegistry } from './interfaces/portal-site-adapter-registry.interface';
import type { IPortalSiteAdapter } from './interfaces/portal-site-adapter.interface';
import type { PortalSiteAdapterMatchContext } from './types/portal-site-adapter.types';

/**
 * Ordered adapter registry (DEC-009). First match wins; none → fail closed at call site.
 * Future Russia adapter: implement `IPortalSiteAdapter`, inject here, append to list.
 */
@Injectable()
export class PortalSiteAdapterRegistry implements IPortalSiteAdapterRegistry {
  private readonly adapters: readonly IPortalSiteAdapter[];

  constructor(belarus: BelarusPortalSiteAdapter) {
    this.adapters = [belarus];
  }

  resolve(ctx: PortalSiteAdapterMatchContext): IPortalSiteAdapter | null {
    for (const adapter of this.adapters) {
      if (adapter.matches(ctx)) {
        return adapter;
      }
    }

    return null;
  }
}

