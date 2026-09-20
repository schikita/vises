/** Admin Webshare proxy list response (owner-console-ux DEC-003). */
export type WebshareProxyOut = {
  id: string;
  maskedAddress: string;
  port: number;
  countryCode?: string;
};

export type WebshareProxiesOut = {
  refreshedAt: string | null;
  count: number;
  proxies: WebshareProxyOut[];
};
