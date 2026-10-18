import { Injectable } from '@nestjs/common';
import { PortalProxyLeaseService } from '../../proxy6';
import type { ProxyProvider } from '../interfaces';
import type {
  ProxyProviderAcquireInput,
  ProxyProviderLease,
} from '../types';

/**
 * Purpose-named ProxyProvider adapter (DEC-015 / DEC-017 / CON-004).
 * Concrete Proxy6 lease stays internal via PortalProxyLeaseService — no Webshare.
 */
@Injectable()
export class ProxyAdapter implements ProxyProvider {
  constructor(private readonly leaseService: PortalProxyLeaseService) {}

  async acquire(input: ProxyProviderAcquireInput): Promise<ProxyProviderLease> {
    return this.leaseService.acquire(input);
  }
}

/** @deprecated Prefer ProxyAdapter (DEC-015). */
export const Proxy6ProxyProviderAdapter = ProxyAdapter;
