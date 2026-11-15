import type { AutofillConfig } from '../types';

/** Portal autofill configuration resolution port. */
export interface IPortalAutofillConfig {
  load(): Promise<AutofillConfig>;
  resolveHeaded(): boolean;
  resolvePortalRegisterUrl(config: AutofillConfig): string;
  resolvePortalLoginUrl(config: AutofillConfig): string;
  resolvePortalManageApplicantsUrl(config: AutofillConfig): string;
  resolvePortalHomeUrl(config: AutofillConfig): string;
}
