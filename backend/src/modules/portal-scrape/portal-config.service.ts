import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../config';
import { isProdNodeEnv } from '../config/utils';
import type { IPortalAutofillConfig } from './interfaces';
import type { AutofillConfig } from './types';
import { DEFAULT_MANAGE_APPLICANTS_PATH } from './constants/portal-status.constants';
import { resolveRegisterPath } from './utils/resolve-register-path.util';
import { resolveLoginPath } from './utils/resolve-login-path.util';
import { trimOrUndefined } from './utils/trim-or-undefined.util';

/**
 * Nest config via ConfigService (CON-001: no secrets/URL invented in repo).
 * Live HTTP autofill requires VISES_PORTAL_BASE_URL (DEC-008).
 * App env keys are Zod-validated at ConfigModule boot.
 *
 * Proxy enablement (proxy6-migration DEC-002 / REQ-022): non-empty PROXY6_API_KEY.
 * OTP product enable is hardcoded true; operators disarm Mail.tm OTP by clearing
 * MAILTM_API_BASE_URL (and/or CapMonster key).
 */
@Injectable()
export class PortalConfigService implements IPortalAutofillConfig {
  constructor(private readonly config: ConfigService<AppEnv, true>) {}
  async load(): Promise<AutofillConfig> {
    const proxy6ApiKey = trimOrUndefined(
      this.config.get('PROXY6_API_KEY', { infer: true }),
    );

    return {
      portalBaseUrl: trimOrUndefined(
        this.config.get('VISES_PORTAL_BASE_URL', { infer: true }),
      ),
      registerPath: resolveRegisterPath(
        this.config.get('VISES_PORTAL_REGISTER_PATH', { infer: true }),
      ),
      loginPath: resolveLoginPath(
        this.config.get('VISES_PORTAL_LOGIN_PATH', { infer: true }),
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
      proxy6Enabled: proxy6ApiKey !== undefined,
      proxy6Misconfigured: false,
      proxy6ApiKey,
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

  /**
   * Resolve absolute portal login URL (REQ-008 / DEC-009).
   * Empty/whitespace login path or missing base → fail closed.
   */
  resolvePortalLoginUrl(config: AutofillConfig): string {
    if (!config.portalBaseUrl?.trim()) {
      throw new Error(
        'VISES_PORTAL_BASE_URL is required for portal login navigation',
      );
    }
    const loginPath = config.loginPath.trim();
    if (loginPath === '') {
      throw new Error(
        'VISES_PORTAL_LOGIN_PATH is required for portal login navigation',
      );
    }
    const base = config.portalBaseUrl.replace(/\/+$/, '');
    const path = loginPath.startsWith('/') ? loginPath : `/${loginPath}`;
    return `${base}${path}`;
  }

  /**
   * Resolve absolute Manage Applicants URL (REQ-018 / TASK-011).
   * Uses fixture path `/Global/appointmentdata/myappointments`.
   */
  resolvePortalManageApplicantsUrl(config: AutofillConfig): string {
    if (!config.portalBaseUrl?.trim()) {
      throw new Error(
        'VISES_PORTAL_BASE_URL is required for portal Manage Applicants navigation',
      );
    }
    const base = config.portalBaseUrl.replace(/\/+$/, '');
    const path = DEFAULT_MANAGE_APPLICANTS_PATH.startsWith('/')
      ? DEFAULT_MANAGE_APPLICANTS_PATH
      : `/${DEFAULT_MANAGE_APPLICANTS_PATH}`;
    return `${base}${path}`;
  }
}
