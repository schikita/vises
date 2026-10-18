import type { CaptchaProvider } from '../interfaces';
import type { CaptchaCircuitBreaker } from './captcha-circuit.types';
import type { PortalCaptchaVerifiedLoopCheckpointSnapshot } from './portal-captcha-verified-loop-checkpoint.types';
import type { PortalLogContext } from '../../portal-core/types/portal-log-context.types';

/**
 * Verified-loop orchestrator I/O (DEC-008 / REQ-001–007).
 * Durable resume fields: DEC-003 (attempt / CB / absolute deadline).
 */

export type RunPortalCaptchaVerifiedLoopInput = {
  captchaServiceApiKey: string;
  /** Base per-attempt captcha-service create+poll timeout (capped by remaining outer ms). */
  timeoutMs: number;
  pollIntervalMs: number;
  /** Purpose captcha port solve entry (DEC-005 / DEC-015). */
  captchaProvider: Pick<CaptchaProvider, 'solveBls3x3'>;
  logContext?: PortalLogContext;
  /**
   * Attempts already consumed (resume). Next attempt index is restoredAttempts + 1.
   * Includes any abandoned in-flight attempt counted by the orchestrator.
   */
  restoredAttempts?: number;
  /**
   * Absolute outer wall-clock deadline. When omitted, loop uses now + MAX_MS.
   */
  budgetDeadlineAt?: Date;
  /** Restored circuit-breaker; when omitted, a fresh closed breaker is created. */
  restoredCircuit?: CaptchaCircuitBreaker;
  /** Persist attempt / CB / deadline after each attempt boundary (DEC-008). */
  onAttemptCheckpoint?: (
    snapshot: PortalCaptchaVerifiedLoopCheckpointSnapshot,
  ) => Promise<void>;
  /** Optional lock heartbeat during long captcha-service polls (DEC-007). */
  onHeartbeat?: () => Promise<void>;
  /**
   * Optional fill/workflow abort signal for progressive unsolvable backoff
   * (capmonster-unsolvable-ten-retry DEC-012 / REQ-014).
   */
  abortSignal?: AbortSignal;
  /**
   * When true (login-prep), episode success accepts `#btnVerified` **or**
   * login form gone / auth progress (REQ-008 / DEC-004). Default false keeps
   * register `#btnVerified`-only behavior (REQ-003).
   */
  acceptLoginAuthSuccess?: boolean;
  /**
   * Optional login email for mid-loop/chain credential ensure (DEC-002).
   * Supplied only when non-empty after trim; omitted → email ensure skipped.
   */
  portalFormEmail?: string;
  /**
   * Optional login password for mid-loop/chain credential ensure (DEC-002).
   * Supplied only when non-empty after trim; omitted → password ensure skipped.
   * Must never be logged (REQ-008).
   */
  portalPassword?: string;
};

export type PortalCaptchaVerifiedLoopStopReason =
  | 'verified'
  | 'circuit_open'
  | 'budget_exhausted'
  | 'permanent'
  | 'portal_error'
  /** CapMonster unsolvable try budget exhausted (ten-retry DEC-002). */
  | 'capmonster_unsolvable_exhausted'
  /** AbortSignal fired during progressive unsolvable wait (DEC-012). */
  | 'aborted'
  /**
   * Supplied login credential could not be ensured before ensure/solve
   * (portal-captcha-credential-refill DEC-001).
   */
  | 'credential_ensure_failed'
  /**
   * Site-processing `.alert.alert-danger` blocked login-form-absence auth
   * (portal-login-site-error DEC-004).
   */
  | 'login_site_processing_error';

export type RunPortalCaptchaVerifiedLoopResult = {
  ok: boolean;
  attempts: number;
  stopReason: PortalCaptchaVerifiedLoopStopReason;
  error?: string;
  /** Structured code for durable last-error (e.g. unsolvable exhaustion). */
  errorCode?: string;
};
