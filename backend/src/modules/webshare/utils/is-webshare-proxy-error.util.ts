import type { WebshareProxyError } from '../types/webshare-proxy.types';

export const isWebshareProxyError = (
  err: unknown,
): err is WebshareProxyError =>
  err instanceof Error &&
  err.name === 'WebshareProxyError' &&
  typeof (err as WebshareProxyError).code === 'string';
