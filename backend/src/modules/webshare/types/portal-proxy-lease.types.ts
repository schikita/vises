import type {
  PatchrightProxyConfig,
  UsableWebshareProxy,
} from './webshare-proxy.types';

export type PortalProxyLease = {
  proxy: UsableWebshareProxy;
  /** Patchright `newContext({ proxy })` config (may include sticky username). */
  browserProxy: PatchrightProxyConfig;
  /** Best-effort release back to the free pool (safe to call once). */
  release: () => Promise<void>;
};
