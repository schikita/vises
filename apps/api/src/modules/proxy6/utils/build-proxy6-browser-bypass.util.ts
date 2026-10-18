import { PROXY6_BROWSER_PROXY_BYPASS_HOSTS } from '../constants';

/**
 * Build Patchright `proxy.bypass` string from module constants (DEC-005).
 * Returns undefined when the list is empty (no bypass clause).
 */
export const buildProxy6BrowserBypass = (
  extraHosts: readonly string[] = [],
): string | undefined => {
  const hosts = [
    ...PROXY6_BROWSER_PROXY_BYPASS_HOSTS,
    ...extraHosts,
  ]
    .map((h) => h.trim())
    .filter((h) => h.length > 0);
  if (hosts.length === 0) return undefined;
  return [...new Set(hosts)].join(',');
};
