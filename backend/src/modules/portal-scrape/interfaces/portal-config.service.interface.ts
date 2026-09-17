import type { AutofillConfig } from '../types';

export interface IPortalConfigService {
  load(): Promise<AutofillConfig>;
  resolveHeaded(): boolean;
  resolvePortalRegisterUrl(config: AutofillConfig): string;
}
