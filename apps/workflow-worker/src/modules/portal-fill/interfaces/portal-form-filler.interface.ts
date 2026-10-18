import type {
  FillRegisterFormOptions,
  FillRegisterFormResult,
} from '../types';

/** Browser RegisterUser form fill port. */
export interface IPortalFormFiller {
  fillRegisterForm(
    options: FillRegisterFormOptions,
  ): Promise<FillRegisterFormResult>;
}
