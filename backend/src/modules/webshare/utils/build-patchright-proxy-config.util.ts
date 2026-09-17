import type {
  PatchrightProxyConfig,
  UsableWebshareProxy,
  WebshareProxyMode,
} from '../types/webshare-proxy.types';
import { buildBackboneProxyServer } from './build-backbone-proxy-server.util';
import { buildBackboneStickyUsername } from './build-backbone-sticky-username.util';
import { buildWebshareProxyServer } from './build-webshare-proxy-server.util';

/**
 * Build Patchright context proxy config from a leased usable proxy.
 * backbone uses p.webshare.io + sticky username suffix (DEC-008).
 */
export const buildPatchrightProxyConfig = (
  proxy: UsableWebshareProxy,
  mode: WebshareProxyMode,
  leaseToken: string,
): PatchrightProxyConfig => {
  if (mode === 'backbone') {
    return {
      server: buildBackboneProxyServer(proxy.port),
      username: buildBackboneStickyUsername(proxy.username, leaseToken),
      password: proxy.password,
    };
  }
  return {
    server: buildWebshareProxyServer(proxy.proxyAddress, proxy.port),
    username: proxy.username,
    password: proxy.password,
  };
};
