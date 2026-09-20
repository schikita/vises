import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../database/entities/setting.entity';
import { settingsOut } from '../../shared/mappers';
import type { AppEnv } from '../config';
import { isProdNodeEnv } from '../config';
import { SeedService } from '../seed/seed.service';
import {
  parseWebshareListTtlMs,
  WEBSHARE_PROXY_MODE,
  WebshareProxyListService,
  type WebshareProxyRuntimeConfig,
} from '../webshare';
import { LOCKED_SUBMIT_CITIES, SETTINGS_SINGLETON_ID } from './constants';
import { PatchSettingsDto } from './dto/patch-settings.dto';
import type { ISettingsService } from './interfaces';
import type { SettingsOut, WebshareProxiesOut } from './types';
import {
  isLockedSubmitCities,
  mapWebshareErrorToRussianDetail,
  mapWebshareProxiesOut,
  trimOrUndefined,
} from './utils';

@Injectable()
export class SettingsService implements ISettingsService {
  constructor(
    @InjectRepository(Setting) private readonly settings: Repository<Setting>,
    private readonly seed: SeedService,
    private readonly config: ConfigService<AppEnv, true>,
    private readonly webshareList: WebshareProxyListService,
  ) {}

  async get(): Promise<SettingsOut> {
    const row = await this.requireRow();
    await this.normalizeLockedCities(row);
    return this.toOut(row);
  }

  async patch(body: PatchSettingsDto): Promise<SettingsOut> {
    const row = await this.requireRow();
    if (body.company !== undefined) {
      row.company = body.company;
    }
    if (body.defaultPrice !== undefined) {
      row.defaultPrice = body.defaultPrice;
    }
    // DEC-011: coerce cities to Minsk-only regardless of client payload.
    row.cities = [...LOCKED_SUBMIT_CITIES];
    if (body.destinations !== undefined) {
      row.destinations = body.destinations;
    }
    if (body.webshareProxyEnabled !== undefined) {
      row.webshareProxyEnabled = body.webshareProxyEnabled;
    }
    if (body.websharePlanId !== undefined) {
      row.websharePlanId = body.websharePlanId.trim();
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

  /** Cached Webshare proxies (masked); no network call (DEC-003). */
  listWebshareProxies(): WebshareProxiesOut {
    return mapWebshareProxiesOut(
      this.webshareList.getCachedProxies(),
      this.webshareList.getCacheFetchedAtMs(),
    );
  }

  /** Force-refresh Webshare list; Russian-safe errors (DEC-003). */
  async refreshWebshareProxies(): Promise<WebshareProxiesOut> {
    try {
      const runtime = await this.buildWebshareRuntimeConfig();
      const proxies = await this.webshareList.getUsableProxies(runtime, true);
      return mapWebshareProxiesOut(
        proxies,
        this.webshareList.getCacheFetchedAtMs(),
      );
    } catch (err) {
      throw new HttpException(
        mapWebshareErrorToRussianDetail(err),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private toOut(row: Setting): SettingsOut {
    const out = settingsOut(row, this.isDemoControlsEnabled());
    return {
      ...out,
      cities: [...LOCKED_SUBMIT_CITIES],
    };
  }

  private isDemoControlsEnabled(): boolean {
    return !isProdNodeEnv(this.config.get('NODE_ENV', { infer: true }));
  }

  private async normalizeLockedCities(row: Setting): Promise<void> {
    if (isLockedSubmitCities(row.cities)) return;
    row.cities = [...LOCKED_SUBMIT_CITIES];
    await this.settings.save(row);
  }

  private async buildWebshareRuntimeConfig(): Promise<WebshareProxyRuntimeConfig> {
    const row = await this.requireRow();
    const webshareApiKey = trimOrUndefined(
      this.config.get('WEBSHARE_API_KEY', { infer: true }),
    );
    const websharePlanId = trimOrUndefined((row.websharePlanId ?? '').trim());
    return {
      // DEC-002: credentials-only effective enablement for admin list/refresh.
      webshareProxyEnabled: webshareApiKey !== undefined,
      webshareProxyMisconfigured: false,
      webshareApiKey,
      webshareProxyMode: WEBSHARE_PROXY_MODE,
      webshareListTtlMs: parseWebshareListTtlMs(
        this.config.get('WEBSHARE_PROXY_LIST_TTL_MS', { infer: true }),
      ),
      websharePlanId,
    };
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
