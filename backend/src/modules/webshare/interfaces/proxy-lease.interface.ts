import type {
  PortalProxyLease,
  WebshareProxyRuntimeConfig,
} from '../types';

/** Browser-session proxy lease acquire / release port. */
export interface IProxyLease {
  acquire(config: WebshareProxyRuntimeConfig): Promise<PortalProxyLease>;
  release(proxyId: string): Promise<void>;
}
