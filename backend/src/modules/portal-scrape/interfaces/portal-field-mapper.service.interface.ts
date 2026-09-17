import type {
  ApplicantInput,
  ApplicationInput,
  MapFieldsOptions,
  MappingResult,
} from '../types';

export interface IPortalFieldMapperService {
  mapFields(
    application: ApplicationInput,
    applicant: ApplicantInput,
    options?: MapFieldsOptions,
  ): MappingResult;
}
