import type { AutofillConfig } from '../types';

export interface IPortalConfigService {
  load(env?: NodeJS.ProcessEnv): AutofillConfig;
  resolveHeaded(config: AutofillConfig, env?: NodeJS.ProcessEnv): boolean;
  resolvePortalRegisterUrl(config: AutofillConfig): string;
}
