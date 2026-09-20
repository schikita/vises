import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../config';
import { isProdNodeEnv } from '../config/utils';
import { SettingsService } from '../settings/settings.service';
import {
  parseWebshareListTtlMs,
  WEBSHARE_PROXY_MODE,
} from '../webshare';
import type { IPortalAutofillConfig } from './interfaces';
import type { AutofillConfig } from './types';
import { resolveRegisterPath } from './utils/resolve-register-path.util';
import { trimOrUndefined } from './utils/trim-or-undefined.util';

/**
 * Nest config via ConfigService (CON-001: no secrets/URL invented in repo).
 * Live HTTP autofill requires VISES_PORTAL_BASE_URL (DEC-008).
 * App env keys are Zod-validated at ConfigModule boot.
 *
 * Webshare / Mail.tm enablement (owner-console-ux DEC-002 + portal-email-otp-mailtm
 * DEC-004): credentials/env gated — do not require settings.webshareProxyEnabled
 * or settings.emailOtpEnabled for arming. OTP product enable is hardcoded true;
 * operators disarm Mail.tm OTP by clearing MAILTM_API_BASE_URL (and/or CapMonster
 * key). Settings DB flags remain for compatibility only.
 */
@Injectable()
export class PortalConfigService implements IPortalAutofillConfig {
  constructor(
    private readonly config: ConfigService<AppEnv, true>,
    private readonly settings: SettingsService,
  ) {}

  async load(): Promise<AutofillConfig> {
    const settingsOut = await this.settings.get();
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
      // DEC-004: product OTP treated enabled; CapMonster + base URL gate arming.
      emailOtpEnabled: true,
      mailTmApiBaseUrl: trimOrUndefined(
        this.config.get('MAILTM_API_BASE_URL', { infer: true }),
      ),
      // DEC-002: effective when API key present (plan/mode from settings/env).
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

  /**
   * Browser headed mode from NODE_ENV only:
   * non-prod → headed; prod (`prod` / `production`) → headless.
   */
  resolveHeaded(): boolean {
    return !isProdNodeEnv(this.config.get('NODE_ENV', { infer: true }));
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
