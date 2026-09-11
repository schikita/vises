import { Injectable } from '@nestjs/common';
import {
  DEFAULT_NAV_TIMEOUT_MS,
  DEFAULT_REGISTER_PATH,
} from './constants';
import type { IPortalConfigService } from './interfaces';
import type { AutofillConfig, GapOverrides } from './types';

function trimOrUndefined(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

function parseNonNegativeInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(
      `Invalid portal timeout ms="${raw}" (expected non-negative integer)`,
    );
  }
  return n;
}

function parseTruthy(raw: string | undefined, defaultValue: boolean): boolean {
  if (raw === undefined || raw.trim() === '') return defaultValue;
  const v = raw.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(v)) return true;
  if (['0', 'false', 'no', 'off'].includes(v)) return false;
  return defaultValue;
}

/**
 * Nest config from process env (CON-001: no secrets/URL invented in repo).
 * Live HTTP autofill requires VISES_PORTAL_BASE_URL (DEC-008).
 */
@Injectable()
export class PortalConfigService implements IPortalConfigService {
  load(env: NodeJS.ProcessEnv = process.env): AutofillConfig {
    const overrides: GapOverrides = {
      passportType: trimOrUndefined(env.VISES_PORTAL_OVERRIDE_PASSPORT_TYPE),
      issuePlace: trimOrUndefined(env.VISES_PORTAL_OVERRIDE_ISSUE_PLACE),
      mobile: trimOrUndefined(env.VISES_PORTAL_OVERRIDE_MOBILE),
    };

    // Unset → live default path; empty string → `/` for local :5500 root (DEC-008).
    const registerPathRaw = env.VISES_PORTAL_REGISTER_PATH;
    const registerPath =
      registerPathRaw === undefined
        ? DEFAULT_REGISTER_PATH
        : registerPathRaw.trim() === ''
          ? '/'
          : registerPathRaw.trim();

    const headedRaw = env.VISES_PORTAL_HEADED?.trim().toLowerCase();
    const headed =
      headedRaw === undefined || headedRaw === ''
        ? true
        : !(headedRaw === '0' || headedRaw === 'false' || headedRaw === 'no');

    return {
      portalBaseUrl: trimOrUndefined(env.VISES_PORTAL_BASE_URL),
      registerPath,
      overrides,
      navTimeoutMs: parseNonNegativeInt(
        env.VISES_PORTAL_NAV_TIMEOUT_MS,
        DEFAULT_NAV_TIMEOUT_MS,
      ),
      headed,
      browserChannel: trimOrUndefined(env.VISES_PORTAL_BROWSER_CHANNEL),
      skipCaptchaGuard: parseTruthy(env.VISES_PORTAL_SKIP_CAPTCHA_GUARD, false),
      clickVerify: parseTruthy(env.VISES_PORTAL_CLICK_VERIFY, false),
      keepOpenMs: parseNonNegativeInt(env.VISES_PORTAL_KEEP_OPEN_MS, 0),
    };
  }

  /**
   * Dev headed policy (DEC-006 / REQ-008):
   * `NODE_ENV !== 'production'` ⇒ always headed; production honors config.
   */
  resolveHeaded(
    config: AutofillConfig,
    env: NodeJS.ProcessEnv = process.env,
  ): boolean {
    if (env.NODE_ENV !== 'production') {
      return true;
    }
    return config.headed;
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
    // Avoid double slash when path is `/` → `http://host:5500/`
    if (path === '/') {
      return `${base}/`;
    }
    return `${base}${path}`;
  }
}
