import type {
  UsableWebshareProxy,
  WebshareProxyRuntimeConfig,
} from '../types';

/** Cached proxy-list lookup / refresh port. */
export interface IProxyList {
  getUsableProxies(
    config: WebshareProxyRuntimeConfig,
    forceRefresh?: boolean,
  ): Promise<Map<string, UsableWebshareProxy>>;
  getCachedProxies(): Map<string, UsableWebshareProxy>;
  getCacheFetchedAtMs(): number;
}
