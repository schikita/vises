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
  /** Admin: use Webshare proxies for portal autofill (requires WEBSHARE_API_KEY). */
  webshareProxyEnabled: boolean;
  /** Optional Webshare plan_id; empty string omits plan_id on list API. */
  websharePlanId: string;
};
