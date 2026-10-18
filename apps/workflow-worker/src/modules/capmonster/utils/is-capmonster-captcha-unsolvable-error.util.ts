import { CAPMONSTER_ERROR_CAPTCHA_UNSOLVABLE } from '../constants';
import type { CapMonsterClientError } from '../types';
import { isCapMonsterClientError } from './is-capmonster-client-error.util';

/**
 * True when CapMonster returned exact business code ERROR_CAPTCHA_UNSOLVABLE
 * (DEC-006). Does not match on errorDescription prose.
 */
export const isCapMonsterCaptchaUnsolvableError = (
  err: unknown,
): err is CapMonsterClientError =>
  isCapMonsterClientError(err) &&
  (err.errorCode?.trim() ?? '') === CAPMONSTER_ERROR_CAPTCHA_UNSOLVABLE;
