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
};
