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
  PORTAL_AUTOFILL_SERVICE,
  PORTAL_CONFIG_SERVICE,
  PORTAL_DATA_SERVICE,
  PORTAL_FIELD_MAPPER_SERVICE,
  PORTAL_FILL_SERVICE,
} from './constants';

export type {
  IPortalAutofillService,
  IPortalConfigService,
  IPortalDataService,
  IPortalFieldMapperService,
  IPortalFillService,
} from './interfaces';
