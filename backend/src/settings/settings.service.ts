import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../database/entities/setting.entity';
import { settingsOut } from '../common/mappers';
import { SeedService } from '../seed/seed.service';
import { SETTINGS_SINGLETON_ID } from './constants';
import { PatchSettingsDto } from './dto/patch-settings.dto';
import type { ISettingsService } from './interfaces';
import type { SettingsOut } from './types';

@Injectable()
export class SettingsService implements ISettingsService {
  constructor(
    @InjectRepository(Setting) private readonly settings: Repository<Setting>,
    private readonly seed: SeedService,
  ) {}

  async get(): Promise<SettingsOut> {
    return settingsOut(await this.requireRow());
  }

  async patch(body: PatchSettingsDto): Promise<SettingsOut> {
    const row = await this.requireRow();
    if (body.company !== undefined) {
      row.company = body.company;
    }
    if (body.defaultPrice !== undefined) {
      row.defaultPrice = body.defaultPrice;
    }
    if (body.cities !== undefined) {
      row.cities = body.cities;
    }
    if (body.destinations !== undefined) {
      row.destinations = body.destinations;
    }
    await this.settings.save(row);
    return settingsOut(row);
  }

  async resetDemo(): Promise<{ ok: true }> {
    await this.seed.resetDemo();
    return { ok: true };
  }

  private async requireRow(): Promise<Setting> {
    const row = await this.settings.findOne({
      where: { id: SETTINGS_SINGLETON_ID },
    });
    if (!row) {
      throw new HttpException('Нет настроек', HttpStatus.NOT_FOUND);
    }
    return row;
  }
}
