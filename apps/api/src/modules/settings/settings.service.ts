import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../database/entities/setting.entity';
import { settingsOut } from '../../shared/mappers';
import type { AppEnv } from '../config/types';
import { isProdNodeEnv } from '../config/utils';
import { SeedService } from '../seed/seed.service';
import { SETTINGS_SINGLETON_ID } from './constants';
import { PatchSettingsDto } from './dto/patch-settings.dto';
import type { ISettingsService } from './interfaces';
import type { SettingsOut } from './types';
import {
  normalizeSettingsStringList,
  parsePricePerClientToDefaultPrice,
} from './utils';

@Injectable()
export class SettingsService implements ISettingsService {
  constructor(
    @InjectRepository(Setting) private readonly settings: Repository<Setting>,
    private readonly seed: SeedService,
    private readonly config: ConfigService<AppEnv, true>,
  ) {}

  async get(): Promise<SettingsOut> {
    const row = await this.requireRow();
    return this.toOut(row);
  }

  async patch(body: PatchSettingsDto): Promise<SettingsOut> {
    const row = await this.requireRow();
    if (body.company !== undefined) {
      row.company = body.company;
    }
    if (body.price_per_client !== undefined) {
      row.defaultPrice = parsePricePerClientToDefaultPrice(
        body.price_per_client,
      );
    }
    if (body.cities !== undefined) {
      row.cities = normalizeSettingsStringList(body.cities);
    }
    if (body.destinations !== undefined) {
      row.destinations = normalizeSettingsStringList(body.destinations);
    }
    if (body.emailOtpEnabled !== undefined) {
      row.emailOtpEnabled = body.emailOtpEnabled;
    }
    await this.settings.save(row);
    return this.toOut(row);
  }

  async resetDemo(): Promise<{ ok: true }> {
    if (!this.isDemoControlsEnabled()) {
      throw new HttpException(
        'Сброс демо недоступен в production',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.seed.resetDemo();
    return { ok: true };
  }

  private toOut(row: Setting): SettingsOut {
    return settingsOut(row, this.isDemoControlsEnabled());
  }

  private isDemoControlsEnabled(): boolean {
    return !isProdNodeEnv(this.config.get('NODE_ENV', { infer: true }));
  }

  private async requireRow(): Promise<Setting> {
    const row = await this.settings.findOne({
      where: { id: SETTINGS_SINGLETON_ID },
    });
    if (!row) {
      throw new HttpException('Settings not found', HttpStatus.NOT_FOUND);
    }
    return row;
  }
}
