import type {
  LoadApplicationOptions,
  LoadedApplicationData,
} from '../types';

export interface IPortalDataService {
  load(options: LoadApplicationOptions): Promise<LoadedApplicationData>;
}
