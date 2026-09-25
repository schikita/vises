/**
 * Abstract captcha port solve I/O (abstract-external-service-args DEC-008).
 * Vendor CapMonster wire uses `clientKey` inside capmonster/ + adapter map only.
 */
import type { SolveBls3x3ViaCapMonsterResult } from '../../capmonster/types/capmonster.types';

export type CaptchaProviderSolveInput = {
  captchaServiceApiKey: string;
  imagesBase64: string[];
  taskArgument: string;
  /** Total create + poll budget (ms). */
  timeoutMs: number;
  /** Poll interval (ms). */
  pollIntervalMs: number;
};

/** CaptchaProvider.solveBls3x3 result (same shape as CapMonster wire result). */
export type CaptchaProviderSolveResult = SolveBls3x3ViaCapMonsterResult;
