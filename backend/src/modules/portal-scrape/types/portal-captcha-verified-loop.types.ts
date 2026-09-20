import type { ICaptchaSolver } from '../../capmonster';
import type { CapMonsterCircuitBreaker } from './capmonster-circuit.types';
import type { PortalCaptchaVerifiedLoopCheckpointSnapshot } from './portal-autofill-checkpoint.types';
import type { PortalLogContext } from './portal-log-context.types';

/**
 * Verified-loop orchestrator I/O (DEC-008 / REQ-001–007).
 * Durable resume fields: DEC-003 (attempt / CB / absolute deadline).
 */

export type RunPortalCaptchaVerifiedLoopInput = {
  clientKey: string;
  /** Base per-attempt CapMonster create+poll timeout (capped by remaining outer ms). */
  timeoutMs: number;
  pollIntervalMs: number;
  capMonster: Pick<ICaptchaSolver, 'solveBls3x3'>;
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
  restoredCircuit?: CapMonsterCircuitBreaker;
  /** Persist attempt / CB / deadline after each attempt boundary (DEC-008). */
  onAttemptCheckpoint?: (
    snapshot: PortalCaptchaVerifiedLoopCheckpointSnapshot,
  ) => Promise<void>;
  /** Optional lock heartbeat during long CapMonster polls (DEC-007). */
  onHeartbeat?: () => Promise<void>;
};

export type PortalCaptchaVerifiedLoopStopReason =
  | 'verified'
  | 'circuit_open'
  | 'budget_exhausted'
  | 'permanent'
  | 'portal_error';

export type RunPortalCaptchaVerifiedLoopResult = {
  ok: boolean;
  attempts: number;
  stopReason: PortalCaptchaVerifiedLoopStopReason;
  error?: string;
};
