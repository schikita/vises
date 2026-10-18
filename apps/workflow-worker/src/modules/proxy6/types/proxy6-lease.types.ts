/**
 * Proxy6 lease + Patchright proxy types (DEC-003 / DEC-005 / DEC-006).
 */

import type { Proxy6Proxy } from '../../database/entities/proxy6-proxy.entity';

export type UsableProxy6Proxy = {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  country?: string;
  proxyType: string;
};

/**
 * Internal fair-lease selection outcome (DEC-001).
 * Thrown to callers only after outer acquire maps these to Proxy6ApiError.
 */
export type Proxy6LeaseSelectResult =
  | { status: 'leased'; row: Proxy6Proxy }
  | { status: 'empty_pool' }
  | { status: 'all_leased' };

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
