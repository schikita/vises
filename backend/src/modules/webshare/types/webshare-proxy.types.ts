/**
 * Webshare Proxy List / lease domain types (webshare-portal-proxy).
 * Credentials stay in-process only — never on client reports (DEC-009 / REQ-012).
 */

export type WebshareProxyMode = 'direct' | 'backbone';

/** Raw row from Webshare Proxy List API (snake_case JSON). */
export type WebshareProxyListRow = {
  id: number | string;
  username?: string | null;
  password?: string | null;
  proxy_address?: string | null;
  port?: number | string | null;
  valid?: boolean | null;
  country_code?: string | null;
};

export type WebshareProxyListResponse = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: WebshareProxyListRow[];
};

/** Assignable proxy after client-side usability filter (REQ-003). */
export type UsableWebshareProxy = {
  id: string;
  proxyAddress: string;
  port: number;
  username: string;
  password: string;
  countryCode?: string;
};

export type WebshareProxyErrorCode =
  | 'misconfigured'
  | 'auth'
  | 'rate_limited'
  | 'empty_pool'
  | 'all_leased'
  | 'list_failed';

export type WebshareProxyError = Error & {
  code: WebshareProxyErrorCode;
  name: 'WebshareProxyError';
};

export type PatchrightProxyConfig = {
  server: string;
  username?: string;
  password?: string;
};
