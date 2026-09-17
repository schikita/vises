import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Application } from '../database/entities/application.entity';
import { Setting } from '../database/entities/setting.entity';
import { hashPassword, utcNow } from '../../shared/utils';
import {
  SEED_ADMIN_INVITE_TOKEN,
  SEED_ADMIN_PASSWORD,
  SEED_ADMIN_USER_ID,
  SEED_CITIES,
  SEED_CLIENT_INVITE_TOKEN,
  SEED_CLIENT_PASSWORD,
  SEED_CLIENT_USER_ID,
  SEED_COMPANY,
  SEED_DEFAULT_PRICE,
  SEED_DESTINATIONS,
  SEED_MANAGER_INVITE_TOKEN,
  SEED_MANAGER_PASSWORD,
  SEED_MANAGER_USER_ID,
  SEED_SETTINGS_ID,
  SEED_WEBSHARE_PLAN_ID,
  SEED_WEBSHARE_PROXY_ENABLED,
} from './constants';
import { buildSampleApps } from './utils';

/**
 * Seed-if-empty parity with `backend/app/seed.py` (REQ-015 / DEC-003).
 * `resetDemo` shared with settings reset (TASK-009).
 */
@Injectable()
export class SeedService implements OnModuleInit {
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
    if (userCount === 0) {
      const now = utcNow();
      await this.users.save([
        this.users.create({
          id: SEED_ADMIN_USER_ID,
          name: 'Vises Admin',
          login: 'admin',
          email: 'admin@vises.app',
          passwordHash: hashPassword(SEED_ADMIN_PASSWORD),
          invitePassword: SEED_ADMIN_PASSWORD,
          role: 'admin',
          active: true,
          inviteToken: SEED_ADMIN_INVITE_TOKEN,
          createdAt: now,
          updatedAt: now,
        }),
        this.users.create({
          id: SEED_MANAGER_USER_ID,
          name: 'Maria',
          login: 'maria@vises.app',
          email: 'maria@vises.app',
          passwordHash: hashPassword(SEED_MANAGER_PASSWORD),
          invitePassword: SEED_MANAGER_PASSWORD,
          role: 'manager',
          active: true,
          inviteToken: SEED_MANAGER_INVITE_TOKEN,
          createdAt: now,
          updatedAt: now,
        }),
        this.users.create({
          id: SEED_CLIENT_USER_ID,
          name: 'Anna Volkova',
          login: 'anna@example.com',
          email: 'anna@example.com',
          passwordHash: hashPassword(SEED_CLIENT_PASSWORD),
          invitePassword: SEED_CLIENT_PASSWORD,
          role: 'client',
          active: true,
          inviteToken: SEED_CLIENT_INVITE_TOKEN,
          createdAt: now,
          updatedAt: now,
        }),
      ]);
      this.logger.log('Seeded users (u-admin, u-maria, u-anna)');
    }

    const settingCount = await this.settings.count();
    if (settingCount === 0) {
      await this.settings.save(
        this.settings.create({
          id: SEED_SETTINGS_ID,
          company: SEED_COMPANY,
          defaultPrice: SEED_DEFAULT_PRICE,
          cities: [...SEED_CITIES],
          destinations: [...SEED_DESTINATIONS],
          webshareProxyEnabled: SEED_WEBSHARE_PROXY_ENABLED,
          websharePlanId: SEED_WEBSHARE_PLAN_ID,
        }),
      );
      this.logger.log('Seeded settings id=1');
    }

    const appCount = await this.applications.count();
    if (appCount === 0) {
      await this.applications.save(buildSampleApps(this.applications));
      this.logger.log('Seeded sample applications (a1, a2, a5)');
    }

    if (userCount > 0 && settingCount > 0 && appCount > 0) {
      this.logger.log('Seed skipped — tables already populated');
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
