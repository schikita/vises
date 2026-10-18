import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Proxy6 owned-proxy inventory + lease state (proxy6-migration DEC-001/003).
 * Credentials stay DB-only; never return password/user on admin list APIs (NFR-003).
 */
@Entity({ name: 'proxy6_proxies' })
export class Proxy6Proxy {
  /** Proxy6 internal proxy id (string form of API `id`). */
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  host!: string;

  @Column({ type: 'int' })
  port!: number;

  @Column({ type: 'varchar', length: 120 })
  username!: string;

  @Column({ type: 'varchar', length: 120 })
  password!: string;

  /** `http` | `socks` | `auto` (default `auto`). */
  @Column({ name: 'proxy_type', type: 'varchar', length: 16, default: 'auto' })
  proxyType!: string;

  @Column({ type: 'varchar', length: 8, nullable: true })
  country!: string | null;

  /** Proxy6 version; primary scope is 4 (IPv4). */
  @Column({ type: 'int', default: 4 })
  version!: number;

  /** Last buy/prolong period (days). */
  @Column({ name: 'period_days', type: 'int', default: 0 })
  periodDays!: number;

  @Column({ type: 'timestamptz', nullable: true })
  date!: Date | null;

  @Column({ name: 'date_end', type: 'timestamptz' })
  dateEnd!: Date;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'varchar', length: 50, default: '' })
  descr!: string;

  @Column({ name: 'in_use', type: 'boolean', default: false })
  inUse!: boolean;

  @Column({ name: 'lease_token', type: 'varchar', length: 64, nullable: true })
  leaseToken!: string | null;

  @Column({ name: 'leased_at', type: 'timestamptz', nullable: true })
  leasedAt!: Date | null;

  @Column({ name: 'lease_expires_at', type: 'timestamptz', nullable: true })
  leaseExpiresAt!: Date | null;

  @Column({ name: 'last_leased_at', type: 'timestamptz', nullable: true })
  lastLeasedAt!: Date | null;

  @Column({ name: 'lease_count', type: 'int', default: 0 })
  leaseCount!: number;

  @Column({ name: 'synced_at', type: 'timestamptz', nullable: true })
  syncedAt!: Date | null;
}
