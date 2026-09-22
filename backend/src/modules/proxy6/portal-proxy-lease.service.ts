import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { uid } from '../../shared/utils';
import { Proxy6Proxy } from '../database/entities/proxy6-proxy.entity';
import {
  PROXY6_LEASE_STALE_MS,
  PROXY6_MSG_ALL_LEASED,
  PROXY6_MSG_EMPTY_POOL,
  PROXY6_MSG_MISCONFIGURED,
} from './constants';
import type {
  PortalProxyLease,
  Proxy6ProxyRuntimeConfig,
} from './types';
import { buildPatchrightProxyConfig } from './utils/build-patchright-proxy-config.util';
import { createProxy6ApiError } from './utils/create-proxy6-api-error.util';
import { maskProxyAddress } from './utils/mask-proxy-address.util';
import { toUsableProxy6Proxy } from './utils/to-usable-proxy6-proxy.util';

/**
 * DB fair lease with FOR UPDATE SKIP LOCKED (DEC-003 / DEC-004).
 * One lease per browser session; fail closed when none free (REQ-010/024).
 */
@Injectable()
export class PortalProxyLeaseService {
  private readonly logger = new Logger(PortalProxyLeaseService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Proxy6Proxy)
    private readonly repo: Repository<Proxy6Proxy>,
  ) {}

  async acquire(config: Proxy6ProxyRuntimeConfig): Promise<PortalProxyLease> {
    if (config.proxy6Misconfigured || !config.proxy6ApiKey?.trim()) {
      throw createProxy6ApiError({
        code: 'misconfigured',
        message: PROXY6_MSG_MISCONFIGURED,
      });
    }

    const row = await this.dataSource.transaction(async (manager) => {
      const now = new Date();

      await manager
        .createQueryBuilder()
        .update(Proxy6Proxy)
        .set({
          inUse: false,
          leaseToken: null,
          leasedAt: null,
          leaseExpiresAt: null,
        })
        .where('in_use = :inUse', { inUse: true })
        .andWhere('lease_expires_at IS NOT NULL')
        .andWhere('lease_expires_at < :now', { now })
        .execute();

      const candidate = await manager
        .createQueryBuilder(Proxy6Proxy, 'p')
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .where('p.active = :active', { active: true })
        .andWhere('p.date_end > :now', { now })
        .andWhere('p.in_use = :inUse', { inUse: false })
        .andWhere("TRIM(p.host) <> ''")
        .andWhere('p.port > 0')
        .andWhere("TRIM(p.username) <> ''")
        .andWhere("TRIM(p.password) <> ''")
        .orderBy('p.last_leased_at', 'ASC', 'NULLS FIRST')
        .addOrderBy('p.id', 'ASC')
        .take(1)
        .getOne();

      if (!candidate) {
        const usableCount = await manager
          .createQueryBuilder(Proxy6Proxy, 'p')
          .where('p.active = :active', { active: true })
          .andWhere('p.date_end > :now', { now })
          .andWhere("TRIM(p.host) <> ''")
          .andWhere('p.port > 0')
          .andWhere("TRIM(p.username) <> ''")
          .andWhere("TRIM(p.password) <> ''")
          .getCount();
        if (usableCount === 0) {
          throw createProxy6ApiError({
            code: 'empty_pool',
            message: PROXY6_MSG_EMPTY_POOL,
          });
        }
        throw createProxy6ApiError({
          code: 'all_leased',
          message: PROXY6_MSG_ALL_LEASED,
        });
      }

      const leaseToken = uid('p6').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
      candidate.inUse = true;
      candidate.leaseToken = leaseToken;
      candidate.leasedAt = now;
      candidate.leaseExpiresAt = new Date(now.getTime() + PROXY6_LEASE_STALE_MS);
      candidate.lastLeasedAt = now;
      candidate.leaseCount = (candidate.leaseCount ?? 0) + 1;
      await manager.save(candidate);
      return candidate;
    });

    const proxy = toUsableProxy6Proxy(row);
    const browserProxy = buildPatchrightProxyConfig(proxy);

    this.logger.log(
      `Proxy6 proxy leased id=${proxy.id} address=${maskProxyAddress(proxy.host)} country=${proxy.country ?? '-'}`,
    );

    let released = false;
    const release = async (): Promise<void> => {
      if (released) return;
      released = true;
      await this.release(proxy.id);
    };

    return { proxy, browserProxy, release };
  }

  /** Idempotent clear of in-use lease fields for a proxy id. */
  async release(proxyId: string): Promise<void> {
    const id = proxyId.trim();
    if (id === '') return;
    await this.repo.update(
      { id },
      {
        inUse: false,
        leaseToken: null,
        leasedAt: null,
        leaseExpiresAt: null,
      },
    );
    this.logger.log(`Proxy6 proxy released id=${id}`);
  }
}
