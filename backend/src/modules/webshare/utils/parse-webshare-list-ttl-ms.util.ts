import { WEBSHARE_PROXY_LIST_TTL_MS_DEFAULT } from '../constants/webshare-proxy.constants';

/**
 * Parse WEBSHARE_PROXY_LIST_TTL_MS. Empty or non-positive → default 60000.
 */
export const parseWebshareListTtlMs = (raw: string | undefined): number => {
  const token = (raw ?? '').trim();
  if (token === '') return WEBSHARE_PROXY_LIST_TTL_MS_DEFAULT;
  const parsed = Number.parseInt(token, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return WEBSHARE_PROXY_LIST_TTL_MS_DEFAULT;
  }
  return parsed;
};
