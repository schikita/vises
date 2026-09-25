import { Inject, Injectable } from '@nestjs/common';
import { CAPTCHA_SOLVER } from '../../capmonster/constants/capmonster-di.tokens';
import type { ICaptchaSolver } from '../../capmonster/interfaces/captcha-solver.interface';
import type { CaptchaProvider } from '../interfaces/captcha-provider.interface';
import type {
  CaptchaProviderSolveInput,
  CaptchaProviderSolveResult,
} from '../types/captcha-provider.types';

/**
 * Purpose-named CaptchaProvider adapter (DEC-015 / DEC-017 / CON-005).
 * Concrete CapMonster ICaptchaSolver stays internal — no new anti-bot stack.
 * Maps abstract captchaServiceApiKey → CapMonster wire clientKey (DEC-008).
 */
@Injectable()
export class CaptchaAdapter implements CaptchaProvider {
  constructor(
    @Inject(CAPTCHA_SOLVER)
    private readonly captchaSolver: ICaptchaSolver,
  ) {}

  async solveBls3x3(
    input: CaptchaProviderSolveInput,
  ): Promise<CaptchaProviderSolveResult> {
    return this.captchaSolver.solveBls3x3({
      clientKey: input.captchaServiceApiKey,
      imagesBase64: input.imagesBase64,
      taskArgument: input.taskArgument,
      timeoutMs: input.timeoutMs,
      pollIntervalMs: input.pollIntervalMs,
    });
  }
}

/** @deprecated Prefer CaptchaAdapter (DEC-015). */
export const CapMonsterCaptchaProviderAdapter = CaptchaAdapter;
