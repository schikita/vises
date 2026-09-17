import type {
  WebshareProxyError,
  WebshareProxyErrorCode,
} from '../types/webshare-proxy.types';

/** Build a typed Webshare failure (no secrets in message). */
export const createWebshareProxyError = (
  code: WebshareProxyErrorCode,
  message: string,
): WebshareProxyError => {
  const err = new Error(message) as WebshareProxyError;
  err.name = 'WebshareProxyError';
  err.code = code;
  return err;
};
