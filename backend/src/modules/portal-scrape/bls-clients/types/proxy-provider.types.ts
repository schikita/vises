import type {
  PortalProxyLease,
  Proxy6ProxyRuntimeConfig,
} from '../../../proxy6';

/** Acquire input for workflow ProxyProvider (DEC-017) — Proxy6 lease config. */
export type ProxyProviderAcquireInput = Proxy6ProxyRuntimeConfig;

/** Lease handle returned by ProxyProvider.acquire (release via lease.release). */
export type ProxyProviderLease = PortalProxyLease;
