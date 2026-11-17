import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, type EntityManager, Repository } from 'typeorm';
import { utcNow } from '../../shared/utils';
import { ApplicationStatusHistory } from '../database/entities/application-status-history.entity';
import { Application } from '../database/entities/application.entity';
import { BalanceTransaction } from '../database/entities/balance-transaction.entity';
import { Client } from '../database/entities/client.entity';
import { Setting } from '../database/entities/setting.entity';
import { User } from '../database/entities/user.entity';
import { clearAllOperationalTables } from '../database/utils';
import { PiiCryptoService } from '../pii';
import {
  SEED_CITIES,
  SEED_COMPANY,
  SEED_DEFAULT_PRICE,
  SEED_DESTINATIONS,
  SEED_EMAIL_OTP_ENABLED,
  SEED_SETTINGS_ID,
} from './constants';
import type { IDemoDataSeeder } from './interfaces';
import { buildFr11SeedDataset, buildSeedUsers } from './utils';

/**
 * Seed-if-empty for FR-11 / AC-18 / AC-19.
 * Seeds only when users + settings + applications are all empty (avoids
 * partial-population mismatch against legacy rows). Otherwise skips;
 * use admin/superadmin reset-demo after a manual backup for a full reseed.
 * Passport seed fields are encrypted via {@link PiiCryptoService}.
 */
@Injectable()
export class SeedService implements OnModuleInit, IDemoDataSeeder {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly piiCrypto: PiiCryptoService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Application)
    private readonly applications: Repository<Application>,
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(Setting) private readonly settings: Repository<Setting>,
    @InjectRepository(ApplicationStatusHistory)
    private readonly history: Repository<ApplicationStatusHistory>,
    @InjectRepository(BalanceTransaction)
    private readonly ledger: Repository<BalanceTransaction>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedIfEmpty();
  }

  async seedIfEmpty(): Promise<void> {
    const userCount = await this.users.count();
    const settingCount = await this.settings.count();
    const appCount = await this.applications.count();

    const fullyEmpty =
      userCount === 0 && settingCount === 0 && appCount === 0;
    if (!fullyEmpty) {
      if (userCount > 0 && settingCount > 0 && appCount > 0) {
        this.logger.log('Seed skipped — tables already populated');
      } else {
        this.logger.warn(
          'Seed skipped — partial population (use reset-demo after backup for FR-11 reseed)',
        );
      }
      return;
    }

    const now = utcNow();
    const seededUsers = buildSeedUsers(this.users, now);
    const dataset = buildFr11SeedDataset({
      applications: this.applications,
      clients: this.clients,
      history: this.history,
      ledger: this.ledger,
      superadminId: seededUsers.superadminId,
      agentPlans: seededUsers.agentPlans,
      now,
      encryptFields: (fields) => this.piiCrypto.encryptFields(fields),
    });

    await this.dataSource.transaction(
      async (manager: EntityManager): Promise<void> => {
        await manager.save(User, seededUsers.users);
        await manager.save(
          Setting,
          manager.create(Setting, {
            id: SEED_SETTINGS_ID,
            company: SEED_COMPANY,
            defaultPrice: SEED_DEFAULT_PRICE,
            cities: [...SEED_CITIES],
            destinations: [...SEED_DESTINATIONS],
            emailOtpEnabled: SEED_EMAIL_OTP_ENABLED,
          }),
        );
        await manager.save(Client, dataset.clients);
        await manager.save(Application, dataset.applications);
        await manager.save(ApplicationStatusHistory, dataset.history);
        await manager.save(BalanceTransaction, dataset.ledger);
      },
    );

    this.logger.log(
      `Seeded FR-11 users=${seededUsers.users.length} agents=${seededUsers.agentPlans.length} clients=${dataset.clients.length} apps=${dataset.applications.length} history=${dataset.history.length} ledger=${dataset.ledger.length} price_per_client=${SEED_DEFAULT_PRICE}`,
    );
  }

  /**
   * Full DB reset (FR-10 / AC-18): truncate all operational tables, then seed.
   * Does **not** perform a backup — operator must backup beforehand.
   */
  async resetDemo(): Promise<void> {
    await clearAllOperationalTables(this.dataSource);
    this.logger.log(
      'Full DB reset: all operational tables truncated (no backup performed)',
    );
    await this.seedIfEmpty();
  }
}
