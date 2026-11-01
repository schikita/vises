/**
 * Settings API shape for roles-and-applications (FR-3 / AC-4).
 * `price_per_client` maps from `Setting.defaultPrice` / `default_price`.
 * Money fields are decimal strings (NFR-1 / §6.8).
 */
export type SettingsDto = {
  price_per_client: string;
};
