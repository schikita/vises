import type { FieldResult } from './portal-field.types';
import type { MappingResult } from './portal-mapping.types';

export interface FillRegisterFormOptions {
  /** Absolute file path or http(s) URL. */
  targetUrl: string;
  mapping: MappingResult;
  navTimeoutMs: number;
  headed: boolean;
  /** Optional path to write a PNG after fill (operator/verifier evidence). */
  screenshotPath?: string;
  /** e.g. `chrome` / `msedge` — use installed browser when bundled Chromium missing. */
  browserChannel?: string;
  /** Skip CAPTCHA/anti-bot abort (operator handles CAPTCHA elsewhere). */
  skipCaptchaGuard?: boolean;
  /** Click `#btnVerify` after successful field fill. */
  clickVerify?: boolean;
  /** Keep browser open after fill/verify (ms). */
  keepOpenMs?: number;
}

export interface FillRegisterFormResult {
  navigationOk: boolean;
  /** Hard failure before/during navigation or missing #myForm. */
  error?: string;
  fields: FieldResult[];
  countryCodeObserved?: string;
  verifyClicked: boolean;
  emailOtpTouched: false;
  screenshotPath?: string;
  usedStandIn?: boolean;
}

export type WidgetOpResult = {
  ok: boolean;
  reason?: string;
  via?: string;
  value?: string;
  visible?: string;
  text?: string;
};
