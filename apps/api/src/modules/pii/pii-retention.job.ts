import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { AppEnv } from '../config';
import { Client } from '../database/entities/client.entity';
import { PII_ENCRYPTED_FIELD_KEYS, PII_RETENTION_CRON } from './constants';
import { buildPiiNullEncryptedFields } from './utils';

/**
 * Nulls FR-6 encrypted Client columns after `PII_RETENTION_MONTHS` (AC-11).
 * Keeps the client row. Uses TypeORM DI only — no `shared` → `modules` imports.
 */
@Injectable()
export class PiiRetentionJob {
  private readonly nestLogger = new Logger(PiiRetentionJob.name);

  constructor(
    private readonly config: ConfigService<AppEnv, true>,
    @InjectRepository(Client)
    private readonly clients: Repository<Client>,
  ) {}

  @Cron(PII_RETENTION_CRON)
  async anonymizeExpiredPassportFields(): Promise<void> {
    const months = this.resolveRetentionMonths();
    const cutoff = this.computeCutoff(months);
    const nullFields = buildPiiNullEncryptedFields();
    const result = await this.clients
      .createQueryBuilder()
      .update(Client)
      .set({
        ...nullFields,
        updatedAt: new Date(),
      })
      .where('created_at < :cutoff', { cutoff })
      .andWhere(this.buildHasEncryptedPredicate())
      .execute();

    this.nestLogger.log(
      `PII retention: nulled encrypted fields on ${String(result.affected ?? 0)} client(s) older than ${String(months)} month(s)`,
    );
  }

  /** Exposed for unit tests — same cutoff math as the cron path. */
  computeCutoff(months: number, now: Date = new Date()): Date {
    const cutoff = new Date(now.getTime());
    cutoff.setUTCMonth(cutoff.getUTCMonth() - months);
    return cutoff;
  }

  resolveRetentionMonths(): number {
    const raw = this.config.get('PII_RETENTION_MONTHS', { infer: true });
    const months = Number(raw.trim());
    if (!Number.isInteger(months) || months <= 0) {
      throw new Error('PII_RETENTION_MONTHS must be a positive integer');
    }
    return months;
  }

  private buildHasEncryptedPredicate(): string {
    return PII_ENCRYPTED_FIELD_KEYS.map((key) => {
      const column = this.toSnakeColumn(key);
      return `${column} IS NOT NULL`;
    }).join(' OR ');
  }

  private toSnakeColumn(key: string): string {
    return key.replace(/[A-Z]/g, (ch) => `_${ch.toLowerCase()}`);
  }
}
