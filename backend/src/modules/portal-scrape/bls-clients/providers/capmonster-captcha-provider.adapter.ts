import { Inject, Injectable } from '@nestjs/common';
import {
  CAPTCHA_SOLVER,
  type ICaptchaSolver,
} from '../../../capmonster';
import type { CaptchaProvider } from '../interfaces';
import type {
  CaptchaProviderSolveInput,
  CaptchaProviderSolveResult,
} from '../types';

/**
 * Thin CaptchaProvider adapter over CapMonster ICaptchaSolver (DEC-017 / CON-005).
 * No new anti-bot stack — delegates solveBls3x3 only.
 */
@Injectable()
export class CapMonsterCaptchaProviderAdapter implements CaptchaProvider {
  constructor(
    @Inject(CAPTCHA_SOLVER)
    private readonly captchaSolver: ICaptchaSolver,
  ) {}

  async solveBls3x3(
    input: CaptchaProviderSolveInput,
  ): Promise<CaptchaProviderSolveResult> {
    return this.captchaSolver.solveBls3x3(input);
  }
}
