import type { PatchSettingsDto } from '../dto/patch-settings.dto';
import type { SettingsOut, WebshareProxiesOut } from '../types';

export interface ISettingsService {
  get(): Promise<SettingsOut>;
  patch(body: PatchSettingsDto): Promise<SettingsOut>;
  resetDemo(): Promise<{ ok: true }>;
  listWebshareProxies(): WebshareProxiesOut;
  refreshWebshareProxies(): Promise<WebshareProxiesOut>;
}
