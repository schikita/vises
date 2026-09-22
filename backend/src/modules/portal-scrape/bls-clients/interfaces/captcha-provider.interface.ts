import type {
  CaptchaProviderSolveInput,
  CaptchaProviderSolveResult,
} from '../types';

/**
 * Workflow-facing captcha port (DEC-017).
 * Concrete default: CapMonster solveBls3x3 — no new anti-bot stack.
 */
export interface CaptchaProvider {
  solveBls3x3(
    input: CaptchaProviderSolveInput,
  ): Promise<CaptchaProviderSolveResult>;
}
