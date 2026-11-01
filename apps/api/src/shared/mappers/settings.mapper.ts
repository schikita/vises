import { Setting } from '../../modules/database/entities/setting.entity';
import type { SettingsOut } from '../types';
import { formatPricePerClient } from '../utils/format-price-per-client.util';

/** Settings API out shape (REQ-002, REQ-014, FR-3 / AC-4). */
export const settingsOut = (
  setting: Setting,
  demoControlsEnabled: boolean,
): SettingsOut => ({
  company: setting.company,
  price_per_client: formatPricePerClient(setting.defaultPrice),
  cities: setting.cities || [],
  destinations: setting.destinations || [],
  emailOtpEnabled: Boolean(setting.emailOtpEnabled),
  demoControlsEnabled,
});
