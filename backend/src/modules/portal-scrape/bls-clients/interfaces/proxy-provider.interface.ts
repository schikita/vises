import type {
  ProxyProviderAcquireInput,
  ProxyProviderLease,
} from '../types';

/**
 * Workflow-facing proxy port (DEC-017).
 * Concrete default: Proxy6 DB lease via PortalProxyLeaseService.
 * Fail closed when armed and pool empty — never Webshare.
 */
export interface ProxyProvider {
  acquire(input: ProxyProviderAcquireInput): Promise<ProxyProviderLease>;
}
