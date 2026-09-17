import type {
  WebshareProxyListRow,
  WebshareProxyMode,
} from '../types/webshare-proxy.types';

/**
 * REQ-003 usable filter.
 * direct: valid===true, address, port, username, password.
 * backbone: port, username, password (valid filter not required — DEC-008).
 */
export const isUsableWebshareProxyRow = (
  row: WebshareProxyListRow,
  mode: WebshareProxyMode,
): boolean => {
  const id = row.id;
  if (id === undefined || id === null || String(id).trim() === '') return false;

  const username =
    typeof row.username === 'string' ? row.username.trim() : '';
  const password =
    typeof row.password === 'string' ? row.password.trim() : '';
  if (username.length === 0 || password.length === 0) return false;

  const portRaw = row.port;
  const port =
    typeof portRaw === 'number'
      ? portRaw
      : typeof portRaw === 'string'
        ? Number.parseInt(portRaw.trim(), 10)
        : NaN;
  if (!Number.isFinite(port) || port <= 0) return false;

  if (mode === 'direct') {
    if (row.valid !== true) return false;
    const address =
      typeof row.proxy_address === 'string' ? row.proxy_address.trim() : '';
    return address.length > 0;
  }

  // backbone — DEC-008: no valid===true requirement
  return true;
};
