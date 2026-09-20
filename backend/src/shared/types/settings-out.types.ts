/**
 * API `settings_out` shape (REQ-002).
 * Domain owner: `settings` (re-exported from `settings/types`).
 * Physical home in `common/types` while `settingsOut` mapper lives in `common` (NFR-005 / DEC-011).
 */
export type SettingsOut = {
  company: string;
  defaultPrice: number;
  cities: string[];
  destinations: string[];
  /** Retained DB flag; effective portal enablement is credentials-only (DEC-002). */
  webshareProxyEnabled: boolean;
  /** Optional Webshare plan_id; empty string omits plan_id on list API. */
  websharePlanId: string;
  /** Retained DB flag; effective OTP arming is credentials-only (DEC-002). */
  emailOtpEnabled: boolean;
  /** Derived: true when NODE_ENV is non-prod (owner-console-ux DEC-010). */
  demoControlsEnabled: boolean;
};
