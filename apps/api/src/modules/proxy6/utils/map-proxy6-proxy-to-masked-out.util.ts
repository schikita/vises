import type { Proxy6Proxy } from '../../database/entities/proxy6-proxy.entity';
import type { Proxy6ProxyMaskedOut } from '../types';
import { maskProxyAddress } from './mask-proxy-address.util';

/** Map a DB row to admin-safe masked inventory item (DEC-010). */
export const mapProxy6ProxyToMaskedOut = (
  row: Proxy6Proxy,
): Proxy6ProxyMaskedOut => ({
  id: row.id,
  maskedHost: maskProxyAddress(row.host),
  port: row.port,
  country: row.country,
  version: row.version,
  proxyType: row.proxyType,
  periodDays: row.periodDays,
  dateEnd: row.dateEnd.toISOString(),
  active: row.active,
  inUse: row.inUse,
  leaseCount: row.leaseCount,
  lastLeasedAt: row.lastLeasedAt ? row.lastLeasedAt.toISOString() : null,
  descr: row.descr,
});
