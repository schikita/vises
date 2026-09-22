import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Proxy6Proxy } from '../database/entities/proxy6-proxy.entity';
import { PROXY6_AUTO_RECONCILE_DEBOUNCE_MS } from './constants';
import { Proxy6ApiService } from './proxy6-api.service';
import type {
  Proxy6BuyResponse,
  Proxy6GetProxyResponse,
  Proxy6ProlongResponse,
  Proxy6ProxiesOut,
  Proxy6StatsOut,
} from './types';
import { isUsableProxy6Proxy } from './utils/is-usable-proxy6-proxy.util';
import { mapProxy6ListItemToUpsertFields } from './utils/map-proxy6-list-item-to-upsert-fields.util';
import { mapProxy6ProxyToMaskedOut } from './utils/map-proxy6-proxy-to-masked-out.util';
import { normalizeProxy6List } from './utils/normalize-proxy6-list.util';
import { parseProxy6Date } from './utils/parse-proxy6-date.util';

/**
 * DB-backed Proxy6 inventory upsert / reconcile (REQ-009 / REQ-023).
 * Soft-deactivates rows missing from remote (preferred when in_use).
 */
@Injectable()
export class Proxy6InventoryService {
  private readonly logger = new Logger(Proxy6InventoryService.name);
  private lastAutoReconcileAtMs = 0;

  constructor(
    private readonly api: Proxy6ApiService,
    @InjectRepository(Proxy6Proxy)
    private readonly repo: Repository<Proxy6Proxy>,
  ) {}

  /** Force remote getproxy reconcile into DB (admin refresh). */
  async refreshFromRemote(force = true): Promise<Proxy6ProxiesOut> {
    if (!force) {
      const elapsed = Date.now() - this.lastAutoReconcileAtMs;
      if (
        this.lastAutoReconcileAtMs > 0 &&
        elapsed < PROXY6_AUTO_RECONCILE_DEBOUNCE_MS
      ) {
        return this.listMasked();
      }
    }
    const response = await this.api.getProxy({ state: 'all' });
    await this.upsertFromGetProxy(response);
    this.lastAutoReconcileAtMs = Date.now();
    return this.listMasked();
  }

  /** Persist buy response list with period/expiry (REQ-023). */
  async upsertFromBuy(
    response: Proxy6BuyResponse,
    opts: {
      periodDays: number;
      country: string;
      version: number;
      type: string;
    },
  ): Promise<string[]> {
    const periodDays =
      typeof response.period === 'number' && response.period > 0
        ? response.period
        : opts.periodDays;
    const items = normalizeProxy6List(response.list);
    const ids: string[] = [];
    const now = new Date();
    for (const item of items) {
      const fields = mapProxy6ListItemToUpsertFields({
        item,
        periodDays,
        countryFallback: opts.country,
        versionFallback: opts.version,
        typeFallback: opts.type,
      });
      if (!fields) continue;
      await this.upsertFields(fields, now);
      ids.push(fields.id);
    }
    this.logger.log(`Proxy6 buy upserted count=${ids.length}`);
    return ids;
  }

  /** Update period/expiry from prolong response (REQ-023). */
  async upsertFromProlong(
    response: Proxy6ProlongResponse,
    periodDays: number,
  ): Promise<string[]> {
    const resolvedPeriod =
      typeof response.period === 'number' && response.period > 0
        ? response.period
        : periodDays;
    const items = normalizeProxy6List(response.list);
    const ids: string[] = [];
    const now = new Date();
    for (const item of items) {
      if (item.id === undefined || item.id === null) continue;
      const id = String(item.id).trim();
      if (id === '') continue;
      const dateEnd =
        parseProxy6Date(item.unixtime_end) ?? parseProxy6Date(item.date_end);
      const existing = await this.repo.findOne({ where: { id } });
      if (!existing) {
        this.logger.warn(
          `Proxy6 prolong skipped missing inventory id=${id}`,
        );
        continue;
      }
      existing.periodDays = resolvedPeriod;
      if (dateEnd) {
        existing.dateEnd = dateEnd;
      }
      existing.syncedAt = now;
      existing.active = true;
      await this.repo.save(existing);
      ids.push(id);
    }
    this.logger.log(`Proxy6 prolong upserted count=${ids.length}`);
    return ids;
  }

  /**
   * Soft-deactivate deleted proxies. Prefer soft `active=false` over hard
   * delete when `in_use` (design preference for all deletes).
   */
  async deactivateByIds(ids: string[]): Promise<void> {
    const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
    if (unique.length === 0) return;
    await this.repo.update({ id: In(unique) }, { active: false });
  }

  async listMasked(): Promise<Proxy6ProxiesOut> {
    const rows = await this.repo.find({ order: { id: 'ASC' } });
    const proxies = rows.map(mapProxy6ProxyToMaskedOut);
    return { count: proxies.length, proxies };
  }

  async getStats(): Promise<Proxy6StatsOut> {
    const rows = await this.repo.find({ order: { id: 'ASC' } });
    const now = new Date();
    let active = 0;
    let usable = 0;
    let inUse = 0;
    const proxies = rows.map((row) => {
      if (row.active) active += 1;
      if (isUsableProxy6Proxy(row, now)) usable += 1;
      if (row.inUse) inUse += 1;
      return {
        id: row.id,
        maskedHost: mapProxy6ProxyToMaskedOut(row).maskedHost,
        inUse: row.inUse,
        leaseCount: row.leaseCount,
        lastLeasedAt: row.lastLeasedAt
          ? row.lastLeasedAt.toISOString()
          : null,
        active: row.active,
        dateEnd: row.dateEnd.toISOString(),
      };
    });
    return {
      total: rows.length,
      active,
      usable,
      inUse,
      proxies,
    };
  }

  private async upsertFromGetProxy(
    response: Proxy6GetProxyResponse,
  ): Promise<void> {
    const items = normalizeProxy6List(response.list);
    const remoteIds = new Set<string>();
    const now = new Date();
    for (const item of items) {
      const fields = mapProxy6ListItemToUpsertFields({
        item,
        periodDays: 0,
      });
      if (!fields) continue;
      remoteIds.add(fields.id);
      const existing = await this.repo.findOne({ where: { id: fields.id } });
      await this.upsertFields(
        {
          ...fields,
          // Preserve known period on reconcile when remote omits period.
          periodDays:
            fields.periodDays > 0
              ? fields.periodDays
              : (existing?.periodDays ?? 0),
        },
        now,
        existing ?? undefined,
      );
    }

    const all = await this.repo.find();
    for (const row of all) {
      if (!remoteIds.has(row.id) && row.active) {
        row.active = false;
        row.syncedAt = now;
        await this.repo.save(row);
        this.logger.log(
          `Proxy6 inventory soft-deactivated missing remote id=${row.id} inUse=${row.inUse}`,
        );
      }
    }
  }

  private async upsertFields(
    fields: {
      id: string;
      host: string;
      port: number;
      username: string;
      password: string;
      proxyType: string;
      country: string | null;
      version: number;
      periodDays: number;
      date: Date | null;
      dateEnd: Date;
      active: boolean;
      descr: string;
    },
    syncedAt: Date,
    existing?: Proxy6Proxy,
  ): Promise<void> {
    const row = existing ?? this.repo.create({ id: fields.id });
    row.host = fields.host;
    row.port = fields.port;
    row.username = fields.username;
    row.password = fields.password;
    row.proxyType = fields.proxyType;
    row.country = fields.country;
    row.version = fields.version;
    row.periodDays = fields.periodDays;
    row.date = fields.date;
    row.dateEnd = fields.dateEnd;
    row.active = fields.active;
    row.descr = fields.descr;
    row.syncedAt = syncedAt;
    if (!existing) {
      row.inUse = false;
      row.leaseToken = null;
      row.leasedAt = null;
      row.leaseExpiresAt = null;
      row.lastLeasedAt = null;
      row.leaseCount = 0;
    }
    await this.repo.save(row);
  }
}
