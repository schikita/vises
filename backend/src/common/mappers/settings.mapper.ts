import { Setting } from '../../database/entities/setting.entity';
import type { SettingsOut } from '../types';

export type { SettingsOut };

/** FastAPI `settings_out` parity (REQ-002, REQ-014). */
export function settingsOut(setting: Setting): SettingsOut {
  return {
    company: setting.company,
    defaultPrice: setting.defaultPrice,
    cities: setting.cities || [],
    destinations: setting.destinations || [],
  };
}
