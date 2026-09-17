import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../config';
import { SettingsService } from '../settings/settings.service';
import {
  parseWebshareListTtlMs,
  WEBSHARE_PROXY_MODE,
} from '../webshare';
import type { IPortalConfigService } from './interfaces';
import type { AutofillConfig } from './types';
import { resolveRegisterPath } from './utils/resolve-register-path.util';
import { trimOrUndefined } from './utils/trim-or-undefined.util';

/**
 * Nest config via ConfigService (CON-001: no secrets/URL invented in repo).
 * Live HTTP autofill requires VISES_PORTAL_BASE_URL (DEC-008).
 * App env keys are Zod-validated at ConfigModule boot.
 * Webshare enable + plan_id come from admin Settings (not env).
 */
@Injectable()
export class PortalConfigService implements IPortalConfigService {
  constructor(
    private readonly config: ConfigService<AppEnv, true>,
    private readonly settings: SettingsService,
  ) {}

  async load(): Promise<AutofillConfig> {
    const settingsOut = await this.settings.get();
    const webshareFlagOn = settingsOut.webshareProxyEnabled;
    const webshareApiKey = trimOrUndefined(
      this.config.get('WEBSHARE_API_KEY', { infer: true }),
    );
    const websharePlanId = trimOrUndefined(settingsOut.websharePlanId);

    return {
      portalBaseUrl: trimOrUndefined(
        this.config.get('VISES_PORTAL_BASE_URL', { infer: true }),
      ),
      registerPath: resolveRegisterPath(
        this.config.get('VISES_PORTAL_REGISTER_PATH', { infer: true }),
      ),
      // CapMonster: non-empty trimmed key enables Verify+solve (DEC-002/003).
      capMonsterApiKey: trimOrUndefined(
        this.config.get('CAPMONSTER_API_KEY', { infer: true }),
      ),
      // MailSlurp: non-empty trimmed key; OTP path armed only with CapMonster too (DEC-001).
      mailSlurpApiKey: trimOrUndefined(
        this.config.get('MAILSLURP_API_KEY', { infer: true }),
      ),
      webshareProxyEnabled: webshareFlagOn && webshareApiKey !== undefined,
      webshareProxyMisconfigured: webshareFlagOn && webshareApiKey === undefined,
      webshareApiKey,
      webshareProxyMode: WEBSHARE_PROXY_MODE,
      webshareListTtlMs: parseWebshareListTtlMs(
        this.config.get('WEBSHARE_PROXY_LIST_TTL_MS', { infer: true }),
      ),
      websharePlanId,
    };
  }

  /**
   * Browser headed mode from NODE_ENV only:
   * development (non-production) → headed; production → headless.
   */
  resolveHeaded(): boolean {
    const nodeEnv = this.config
      .get('NODE_ENV', { infer: true })
      .trim()
      .toLowerCase();
    return nodeEnv !== 'production';
  }

  /** Resolve live navigation URL; throws if base URL missing. */
  resolvePortalRegisterUrl(config: AutofillConfig): string {
    if (!config.portalBaseUrl) {
      throw new Error(
        'VISES_PORTAL_BASE_URL is required for portal navigation',
      );
    }
    const base = config.portalBaseUrl.replace(/\/+$/, '');
    const path =
      config.registerPath.trim() === ''
        ? '/'
        : config.registerPath.startsWith('/')
          ? config.registerPath
          : `/${config.registerPath}`;
    if (path === '/') {
      return `${base}/`;
    }
    return `${base}${path}`;
  }
}
