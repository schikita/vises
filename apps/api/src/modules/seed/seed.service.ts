import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Application } from '../database/entities/application.entity';
import { Setting } from '../database/entities/setting.entity';
import { utcNow } from '../../shared/utils';
import {
  SEED_CITIES,
  SEED_COMPANY,
  SEED_DEFAULT_PRICE,
  SEED_DESTINATIONS,
  SEED_EMAIL_OTP_ENABLED,
  SEED_EXTRA_APP_COUNT,
  SEED_EXTRA_CLIENT_COUNT,
  SEED_EXTRA_MANAGER_COUNT,
  SEED_SETTINGS_ID,
} from './constants';
import { buildExtraSeedApps, buildSampleApps, buildSeedUsers } from './utils';
import type { IDemoDataSeeder } from './interfaces';

/**
 * Seed-if-empty parity with `backend/app/seed.py` (REQ-015 / DEC-003).
 * `resetDemo` shared with settings reset (TASK-009).
 */
@Injectable()
export class SeedService implements OnModuleInit, IDemoDataSeeder {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Application)
    private readonly applications: Repository<Application>,
    @InjectRepository(Setting) private readonly settings: Repository<Setting>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedIfEmpty();
  }

  async seedIfEmpty(): Promise<void> {
    const userCount = await this.users.count();
    const settingCount = await this.settings.count();
    const appCount = await this.applications.count();

    if (userCount > 0 && settingCount > 0 && appCount > 0) {
      this.logger.log('Seed skipped — tables already populated');
      return;
    }

    const seededUsers = buildSeedUsers(this.users, utcNow());

    if (userCount === 0) {
      await this.users.save(seededUsers.users);
      const managerCount = 1 + SEED_EXTRA_MANAGER_COUNT;
      const clientCount = 2 + SEED_EXTRA_CLIENT_COUNT;
      this.logger.log(
        `Seeded users (${seededUsers.users.length}: 1 admin, ${managerCount} managers, ${clientCount} clients)`,
      );
    }

    if (settingCount === 0) {
      await this.settings.save(
        this.settings.create({
          id: SEED_SETTINGS_ID,
          company: SEED_COMPANY,
          defaultPrice: SEED_DEFAULT_PRICE,
          cities: [...SEED_CITIES],
          destinations: [...SEED_DESTINATIONS],
          emailOtpEnabled: SEED_EMAIL_OTP_ENABLED,        }),
      );
      this.logger.log('Seeded settings id=1');
    }

    if (appCount === 0) {
      const sample = buildSampleApps(this.applications);
      const extras = buildExtraSeedApps(
        this.applications,
        seededUsers.clients,
        seededUsers.managerNames,
      );
      await this.applications.save([...sample, ...extras]);
      this.logger.log(
        `Seeded applications (${sample.length} fixed + ${SEED_EXTRA_APP_COUNT} random)`,
      );
    }
  }

  /** Clear all domain tables then re-seed (parity with `reset_demo`). */
  async resetDemo(): Promise<void> {
    await this.applications.clear();
    await this.users.clear();
    await this.settings.clear();
    await this.seedIfEmpty();
  }
}
