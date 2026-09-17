import type {
  UsableWebshareProxy,
  WebshareProxyListRow,
  WebshareProxyMode,
} from '../types/webshare-proxy.types';
import { isUsableWebshareProxyRow } from './is-usable-webshare-proxy-row.util';

/** Map a Webshare list row to UsableWebshareProxy when the row passes REQ-003. */
export const toUsableWebshareProxy = (
  row: WebshareProxyListRow,
  mode: WebshareProxyMode,
): UsableWebshareProxy | undefined => {
  if (!isUsableWebshareProxyRow(row, mode)) return undefined;

  const username = (row.username as string).trim();
  const password = (row.password as string).trim();
  const portRaw = row.port;
  const port =
    typeof portRaw === 'number'
      ? portRaw
      : Number.parseInt(String(portRaw).trim(), 10);

  const addressRaw =
    typeof row.proxy_address === 'string' ? row.proxy_address.trim() : '';
  const proxyAddress =
    mode === 'direct'
      ? addressRaw
      : addressRaw.length > 0
        ? addressRaw
        : 'backbone';

  const country =
    typeof row.country_code === 'string' && row.country_code.trim().length > 0
      ? row.country_code.trim()
      : undefined;

  return {
    id: String(row.id),
    proxyAddress,
    port,
    username,
    password,
    ...(country ? { countryCode: country } : {}),
  };
};
