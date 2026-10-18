import type { Proxy6Proxy } from '../../database/entities/proxy6-proxy.entity';

/**
 * Usable for lease when active, not expired, and credentials present (REQ-009).
 */
export const isUsableProxy6Proxy = (
  row: Pick<
    Proxy6Proxy,
    'active' | 'dateEnd' | 'host' | 'port' | 'username' | 'password'
  >,
  now: Date = new Date(),
): boolean => {
  if (!row.active) return false;
  if (!(row.dateEnd instanceof Date) || Number.isNaN(row.dateEnd.getTime())) {
    return false;
  }
  if (row.dateEnd.getTime() <= now.getTime()) return false;
  if (row.host.trim() === '') return false;
  if (!Number.isFinite(row.port) || row.port <= 0) return false;
  if (row.username.trim() === '' || row.password.trim() === '') return false;
  return true;
};
