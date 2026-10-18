import type { CaptchaCircuitBreaker } from './captcha-circuit.types';

/**
 * Snapshot emitted after Verified-loop attempt boundaries (DEC-008).
 * Fill-owned captcha circuit shape (portal-scrape-module-split DEC-004).
 */
export type PortalCaptchaVerifiedLoopCheckpointSnapshot = {
  attempts: number;
  budgetDeadlineAt: Date;
  circuit: CaptchaCircuitBreaker;
  permanentFailed?: boolean;
  inflightTaskId?: string | null;
};
