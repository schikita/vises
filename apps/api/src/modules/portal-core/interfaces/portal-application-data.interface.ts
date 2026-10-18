import type {
  LoadApplicationOptions,
  LoadedApplicationData,
} from '../types';

/** Application + applicant load port for portal autofill. */
export interface IPortalApplicationData {
  load(options: LoadApplicationOptions): Promise<LoadedApplicationData>;
}
