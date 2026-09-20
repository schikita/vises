import type {
  ApplicantInput,
  ApplicationInput,
  MapFieldsOptions,
  MappingResult,
} from '../types';

/** Application/applicant → portal field mapping port. */
export interface IPortalFieldMapper {
  mapFields(
    application: ApplicationInput,
    applicant: ApplicantInput,
    options?: MapFieldsOptions,
  ): MappingResult;
}
