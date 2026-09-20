/** Public API for portal-scrape (Nest HTTP autofill). */
export { PortalScrapeModule } from './portal-scrape.module';
export { PortalAutofillController } from './portal-autofill.controller';
export { PortalAutofillService } from './portal-autofill.service';
export { PortalConfigService } from './portal-config.service';
export { PortalDataService } from './portal-data.service';
export { PortalFieldMapperService } from './portal-field-mapper.service';
export { PortalFillService } from './portal-fill.service';

export type {
  AutofillConfig,
  AutofillReport,
  FillRegisterFormOptions,
  FillRegisterFormResult,
  MappingResult,
  PortalAutofillHttpInput,
  PortalAutofillHttpOutcome,
} from './types';

export {
  PORTAL_AUTOFILL,
  PORTAL_AUTOFILL_CONFIG,
  PORTAL_APPLICATION_DATA,
  PORTAL_FIELD_MAPPER,
  PORTAL_FORM_FILLER,
  PORTAL_SITE_ADAPTER_REGISTRY,
} from './constants';

export type {
  IPortalAutofill,
  IPortalAutofillConfig,
  IPortalApplicationData,
  IPortalFieldMapper,
  IPortalFormFiller,
  IPortalSiteAdapter,
  IPortalSiteAdapterRegistry,
} from './interfaces';

export type {
  PortalClientPortalProgress,
  PortalSiteOutcome,
} from './types';
