import { Injectable } from '@nestjs/common';
import { PortalProxyLeaseService } from '../../../proxy6';
import type { ProxyProvider } from '../interfaces';
import type {
  ProxyProviderAcquireInput,
  ProxyProviderLease,
} from '../types';

/**
 * Thin ProxyProvider adapter over Proxy6 DB lease (DEC-017 / CON-004).
 * Fail-closed behavior stays in PortalProxyLeaseService — no Webshare.
 */
@Injectable()
export class Proxy6ProxyProviderAdapter implements ProxyProvider {
  constructor(private readonly leaseService: PortalProxyLeaseService) {}

  async acquire(input: ProxyProviderAcquireInput): Promise<ProxyProviderLease> {
    return this.leaseService.acquire(input);
  }
}
