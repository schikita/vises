import type { GapOverrides } from './portal-mapping.types';

export interface AutofillConfig {
  portalBaseUrl?: string;
  registerPath: string;
  overrides: GapOverrides;
  navTimeoutMs: number;
  headed: boolean;
  /**
   * Optional Playwright/Patchright browser channel (e.g. `chrome`, `msedge`)
   * when bundled Chromium is not installed (host-only / DEC-010).
   */
  browserChannel?: string;
  /** When true, do not abort on CAPTCHA/anti-bot page clues (operator-owned). */
  skipCaptchaGuard: boolean;
  /** When true, click `#btnVerify` after a successful fill. */
  clickVerify: boolean;
  /** Keep browser open this many ms after fill/verify (manual CAPTCHA tools). */
  keepOpenMs: number;
}
