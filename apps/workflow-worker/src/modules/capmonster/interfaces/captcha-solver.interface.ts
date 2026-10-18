import type {
  SolveBls3x3ViaCapMonsterInput,
  SolveBls3x3ViaCapMonsterResult,
} from '../types';

/** Vendor-agnostic BLS / image captcha solving port. */
export interface ICaptchaSolver {
  solveBls3x3(
    input: SolveBls3x3ViaCapMonsterInput,
  ): Promise<SolveBls3x3ViaCapMonsterResult>;
}
