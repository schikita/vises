/**
 * Narrow Webshare list/lease runtime config (DEC-002).
 * Portal AutofillConfig remains the aggregator and is structurally compatible.
 */

import type { WebshareProxyMode } from './webshare-proxy.types';

export type WebshareProxyRuntimeConfig = {
  /**
   * Effective Webshare portal proxying: settings.webshareProxyEnabled ∧
   * non-empty WEBSHARE_API_KEY.
   */
  webshareProxyEnabled: boolean;
  /**
   * Admin enabled proxies but API key empty — fail closed; do not silent-disable.
   */
  webshareProxyMisconfigured: boolean;
  webshareApiKey?: string;
  /** Hardcoded app mode (`direct`). */
  webshareProxyMode: WebshareProxyMode;
  /** List cache TTL from WEBSHARE_PROXY_LIST_TTL_MS (refresh replaces stored IPs). */
  webshareListTtlMs: number;
  /** From admin settings; omit plan_id query when undefined. */
  websharePlanId?: string;
};
