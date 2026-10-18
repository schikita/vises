import { PROXY6_API_BASE_URL } from '../constants';
import type { BuildProxy6ApiUrlInput } from '../types';

/**
 * Build Proxy6 request URL: `https://px6.link/api/{api_key}/{method}/?params`.
 * Caller must never log the returned URL (contains API key).
 */
export const buildProxy6ApiUrl = (input: BuildProxy6ApiUrlInput): string => {
  const key = input.apiKey.trim();
  const method = (input.method ?? '').trim();
  const base = method
    ? `${PROXY6_API_BASE_URL}/${encodeURIComponent(key)}/${encodeURIComponent(method)}/`
    : `${PROXY6_API_BASE_URL}/${encodeURIComponent(key)}`;

  const url = new URL(base);
  const params = input.params ?? {};
  for (const [name, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (typeof value === 'boolean') {
      if (value) {
        url.searchParams.set(name, '');
      }
      continue;
    }
    url.searchParams.set(name, String(value));
  }
  return url.toString();
};
