/**
 * Proxy6 lease + Patchright proxy types (DEC-003 / DEC-005 / DEC-006).
 */

export type UsableProxy6Proxy = {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  country?: string;
  proxyType: string;
};

/** Patchright `newContext({ proxy })` shape (optional DEC-005 bypass). */
export type PatchrightProxyConfig = {
  server: string;
  username?: string;
  password?: string;
  /** Comma-separated host bypass list (Playwright/Patchright). */
  bypass?: string;
};

export type PortalProxyLease = {
  proxy: UsableProxy6Proxy;
  browserProxy: PatchrightProxyConfig;
  /** Best-effort release back to the free pool (safe to call once). */
  release: () => Promise<void>;
};
