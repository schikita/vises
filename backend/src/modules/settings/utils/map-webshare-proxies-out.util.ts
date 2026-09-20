import type { UsableWebshareProxy } from '../../webshare';
import { maskProxyAddress } from '../../webshare';
import type { WebshareProxiesOut } from '../types';

/** Map cached usable proxies to admin-safe masked response (DEC-003). */
export const mapWebshareProxiesOut = (
  proxies: Map<string, UsableWebshareProxy>,
  cacheFetchedAtMs: number,
): WebshareProxiesOut => {
  const list = [...proxies.values()].map((proxy) => ({
    id: proxy.id,
    maskedAddress: maskProxyAddress(proxy.proxyAddress),
    port: proxy.port,
    ...(proxy.countryCode ? { countryCode: proxy.countryCode } : {}),
  }));
  return {
    refreshedAt:
      cacheFetchedAtMs > 0 ? new Date(cacheFetchedAtMs).toISOString() : null,
    count: list.length,
    proxies: list,
  };
};
