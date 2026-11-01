/**
 * API `settings_out` shape (REQ-002 / FR-3 / AC-4).
 * Domain owner: `settings` (re-exported from `settings/types`).
 * Physical home in `shared/types` while `settingsOut` mapper lives in `shared` (NFR-005 / DEC-011).
 * `price_per_client` mirrors `@vises/contracts` `SettingsDto` (decimal string, NFR-1);
 * physical column remains `default_price` / entity `defaultPrice`.
 * Former third-party proxy settings fields retired (proxy6-migration DEC-002).
 */
export type SettingsOut = {
  company: string;
  /** Decimal string mapped from `Setting.defaultPrice` (FR-3 / AC-4 / NFR-1). */
  price_per_client: string;
  cities: string[];
  destinations: string[];
  /** Retained DB flag; effective OTP arming is credentials-only (DEC-002). */
  emailOtpEnabled: boolean;
  /** Derived: true when NODE_ENV is non-prod (owner-console-ux DEC-010). */
  demoControlsEnabled: boolean;
};
