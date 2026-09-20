import { Setting } from '../../modules/database/entities/setting.entity';
import type { SettingsOut } from '../types';

/** FastAPI `settings_out` parity (REQ-002, REQ-014). */
export const settingsOut = (
  setting: Setting,
  demoControlsEnabled: boolean,
): SettingsOut => ({
  company: setting.company,
  defaultPrice: setting.defaultPrice,
  cities: setting.cities || [],
  destinations: setting.destinations || [],
  webshareProxyEnabled: Boolean(setting.webshareProxyEnabled),
  websharePlanId: (setting.websharePlanId ?? '').trim(),
  emailOtpEnabled: Boolean(setting.emailOtpEnabled),
  demoControlsEnabled,
});
