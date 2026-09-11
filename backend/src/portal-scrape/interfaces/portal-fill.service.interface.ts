import type {
  FillRegisterFormOptions,
  FillRegisterFormResult,
} from '../types';

export interface IPortalFillService {
  fillRegisterForm(
    options: FillRegisterFormOptions,
  ): Promise<FillRegisterFormResult>;
}
