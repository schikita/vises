import type { CaptchaProvider } from '../interfaces';
import type { CaptchaCircuitBreaker } from './captcha-circuit.types';
import type { PortalLogContext } from '../../portal-core/types/portal-log-context.types';
import type { PortalCaptchaVerifiedLoopStopReason } from './portal-captcha-verified-loop.types';

/**
 * Post-pass captcha chain orchestrator I/O (capmonster-chained-captcha DEC-001/009).
 */

/**
 * Log / end tokens when the chain sequence finishes without episode stop.
 * `password_change_landing` = forced Change Password visible (login-auth only).
 */
export type PortalCaptchaChainEndReason =
  | 'no_challenge'
  | 'chain_limit'
  | 'password_change_landing';

/**
 * Outcome of the post-pass wait poll (login-auth Change Password interrupt).
 * Used only when `acceptLoginAuthSuccess` gates the polling wait helper.
 */
export type WaitPortalCaptchaChainAfterPassMsResult =
  | 'elapsed'
  | 'aborted'
  | 'budget_exhausted'
  | 'password_change_landing';

export type RunPortalCaptchaChainAfterPassInput = {
  captchaServiceApiKey: string;
  /** Base per-attempt captcha-service create+poll timeout (capped by remaining outer ms). */
  timeoutMs: number;
  pollIntervalMs: number;
  captchaProvider: Pick<CaptchaProvider, 'solveBls3x3'>;
  logContext?: PortalLogContext;
  logPrefix: string;
  /** 1-based outer Verified-loop attempt index (logging only). */
  attempt: number;
  /**
   * Successful solve-applies already completed in this chain (starts at 1 after
   * the first pass that entered the chain).
   */
  successfulApplies: number;
  /** Current outer burned attempt count (already includes the first pass burn). */
  attempts: number;
  breaker: CaptchaCircuitBreaker;
  remainingMs: () => number;
  abortSignal?: AbortSignal;
  /**
   * When true (login / nested login), poll for forced Change Password during
   * post-pass wait and end the chain early if visible (010 DEC-001/002).
   */
  acceptLoginAuthSuccess?: boolean;
  /** In-episode CapMonster unsolvable try counter (mutated via return values). */
  unsolvableTries: number;
  onHeartbeat?: () => Promise<void>;
  onAttemptCheckpoint: (opts?: {
    attempts?: number;
    permanentFailed?: boolean;
  }) => Promise<void>;
  /**
   * Optional login email for follow-up credential ensure (DEC-002).
   * Supplied only when non-empty after trim; forwarded from verified loop.
   */
  portalFormEmail?: string;
  /**
   * Optional login password for follow-up credential ensure (DEC-002).
   * Supplied only when non-empty after trim; must never be logged (REQ-008).
   */
  portalPassword?: string;
};

/**
 * Chain outcome for the Verified loop:
 * - `chain_ended` → proceed to existing `waitForPortalCaptchaVerified`
 * - `episode_stop` → return from Verified loop with the given stopReason
 * - `continue_outer` → leave chain; continue outer attempt while
 */
export type RunPortalCaptchaChainAfterPassResult =
  | {
      kind: 'chain_ended';
      endReason: PortalCaptchaChainEndReason;
      unsolvableTries: number;
    }
  | {
      kind: 'episode_stop';
      stopReason: PortalCaptchaVerifiedLoopStopReason;
      attempts: number;
      unsolvableTries: number;
      error?: string;
      errorCode?: string;
      permanentFailed?: boolean;
    }
  | {
      kind: 'continue_outer';
      attempts: number;
      unsolvableTries: number;
    };
