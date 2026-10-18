import type { Proxy6Proxy } from '../../database/entities/proxy6-proxy.entity';
import type { UsableProxy6Proxy } from '../types';

/** Map a DB inventory row to the lease-facing usable shape. */
export const toUsableProxy6Proxy = (row: Proxy6Proxy): UsableProxy6Proxy => ({
  id: row.id,
  host: row.host,
  port: row.port,
  username: row.username,
  password: row.password,
  proxyType: row.proxyType,
  ...(row.country ? { country: row.country } : {}),
});
