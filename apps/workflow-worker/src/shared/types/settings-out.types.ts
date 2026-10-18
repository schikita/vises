/**
 * API `settings_out` shape (REQ-002).
 * Domain owner: `settings` (re-exported from `settings/types`).
 * Physical home in `common/types` while `settingsOut` mapper lives in `common` (NFR-005 / DEC-011).
 * Former third-party proxy settings fields retired (proxy6-migration DEC-002).
 */
export type SettingsOut = {
  company: string;
  defaultPrice: number;
  cities: string[];
  destinations: string[];
  /** Retained DB flag; effective OTP arming is credentials-only (DEC-002). */
  emailOtpEnabled: boolean;
  /** Derived: true when NODE_ENV is non-prod (owner-console-ux DEC-010). */
  demoControlsEnabled: boolean;
};
