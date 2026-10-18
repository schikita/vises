import type { PatchrightProxyConfig, UsableProxy6Proxy } from '../types';
import { buildProxy6BrowserBypass } from './build-proxy6-browser-bypass.util';
import { buildProxy6ProxyServer } from './build-proxy6-proxy-server.util';

/**
 * Build Patchright context proxy config from a leased Proxy6 row (DEC-006).
 * Optional best-effort bypass for non-portal hosts (DEC-005).
 */
export const buildPatchrightProxyConfig = (
  proxy: UsableProxy6Proxy,
): PatchrightProxyConfig => {
  const bypass = buildProxy6BrowserBypass();
  return {
    server: buildProxy6ProxyServer(proxy.host, proxy.port),
    username: proxy.username,
    password: proxy.password,
    ...(bypass !== undefined ? { bypass } : {}),
  };
};
