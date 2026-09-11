import type {
  ApplicantInput,
  ApplicationInput,
  GapOverrides,
  MappingResult,
} from '../types';

export interface IPortalFieldMapperService {
  mapFields(
    application: ApplicationInput,
    applicant: ApplicantInput,
    overrides?: GapOverrides,
  ): MappingResult;
}
