import type {
  MapProxy6ListItemToUpsertFieldsInput,
  Proxy6ListItemUpsertFields,
} from '../types';
import { PROXY6_DEFAULT_TYPE, PROXY6_DEFAULT_VERSION } from '../constants';
import { parseProxy6Active } from './parse-proxy6-active.util';
import { parseProxy6Date } from './parse-proxy6-date.util';

/**
 * Map a Proxy6 list item to DB upsert fields.
 * Returns undefined when id/host/port/credentials/expiry are incomplete.
 */
export const mapProxy6ListItemToUpsertFields = (
  input: MapProxy6ListItemToUpsertFieldsInput,
): Proxy6ListItemUpsertFields | undefined => {
  const { item } = input;
  if (item.id === undefined || item.id === null) return undefined;
  const id = String(item.id).trim();
  if (id === '') return undefined;

  const hostRaw =
    typeof item.host === 'string' && item.host.trim() !== ''
      ? item.host.trim()
      : typeof item.ip === 'string'
        ? item.ip.trim()
        : '';
  if (hostRaw === '') return undefined;

  const portRaw = item.port;
  const port =
    typeof portRaw === 'number'
      ? portRaw
      : typeof portRaw === 'string'
        ? Number.parseInt(portRaw.trim(), 10)
        : NaN;
  if (!Number.isFinite(port) || port <= 0) return undefined;

  const username = typeof item.user === 'string' ? item.user.trim() : '';
  const password = typeof item.pass === 'string' ? item.pass.trim() : '';
  if (username === '' || password === '') return undefined;

  const dateEnd =
    parseProxy6Date(item.unixtime_end) ?? parseProxy6Date(item.date_end);
  if (!dateEnd) return undefined;

  const date = parseProxy6Date(item.unixtime) ?? parseProxy6Date(item.date);
  const versionRaw = item.version;
  const version =
    typeof versionRaw === 'number'
      ? versionRaw
      : typeof versionRaw === 'string' && versionRaw.trim() !== ''
        ? Number(versionRaw)
        : (input.versionFallback ?? PROXY6_DEFAULT_VERSION);
  const proxyType =
    typeof item.type === 'string' && item.type.trim() !== ''
      ? item.type.trim()
      : (input.typeFallback ?? PROXY6_DEFAULT_TYPE);
  const countryRaw =
    typeof item.country === 'string' && item.country.trim() !== ''
      ? item.country.trim()
      : (input.countryFallback?.trim() ?? '');

  return {
    id,
    host: hostRaw,
    port,
    username,
    password,
    proxyType,
    country: countryRaw === '' ? null : countryRaw.slice(0, 8),
    version: Number.isFinite(version) ? version : PROXY6_DEFAULT_VERSION,
    periodDays: input.periodDays >= 0 ? input.periodDays : 0,
    date,
    dateEnd,
    active: parseProxy6Active(item.active),
    descr:
      typeof item.descr === 'string' ? item.descr.trim().slice(0, 50) : '',
  };
};
