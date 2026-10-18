import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../config';
import {
  PORTAL_BROWSER_SESSIONS_PER_ATTEMPT,
  PORTAL_CONCURRENCY_CAP_HIT,
  PORTAL_MAX_ATTEMPTS_PER_WORKER_DEFAULT,
} from './constants/browser-session-budget.constants';
import type { BrowserSessionKind } from './types/browser-session-budget.types';

/**
 * Per-worker concurrency gate for portal + mail Chromium sessions (REQ-006 /
 * REQ-024 / DEC-004 / DEC-012). Caps attempts and sessions (up to 2× attempts).
 * Fail-closed / defer — never unbounded launch.
 */
@Injectable()
export class BrowserSessionBudgetService {
  private readonly logger = new Logger(BrowserSessionBudgetService.name);
  private readonly maxAttemptsPerWorker: number;
  private readonly maxSessionsPerWorker: number;
  private activeAttempts = 0;
  private activeSessions = 0;

  constructor(config: ConfigService<AppEnv, true>) {
    const raw = config.get('VISES_PORTAL_MAX_ATTEMPTS_PER_WORKER', {
      infer: true,
    });
    const parsed =
      typeof raw === 'number'
        ? raw
        : Number.parseInt(String(raw ?? '').trim(), 10);
    this.maxAttemptsPerWorker =
      Number.isFinite(parsed) && parsed >= 1
        ? Math.floor(parsed)
        : PORTAL_MAX_ATTEMPTS_PER_WORKER_DEFAULT;
    this.maxSessionsPerWorker =
      this.maxAttemptsPerWorker * PORTAL_BROWSER_SESSIONS_PER_ATTEMPT;
    this.logger.log(
      `browser_session_budget_ready maxAttemptsPerWorker=${this.maxAttemptsPerWorker} maxSessionsPerWorker=${this.maxSessionsPerWorker} sessionsPerAttempt=${PORTAL_BROWSER_SESSIONS_PER_ATTEMPT}`,
    );
  }

  /** True when a new claim/attempt may start without exceeding caps. */
  canClaimAttempt(): boolean {
    return (
      this.activeAttempts < this.maxAttemptsPerWorker &&
      this.activeSessions < this.maxSessionsPerWorker
    );
  }

  /**
   * Reserve an in-flight attempt slot before claim/execute.
   * Returns false when saturated (caller must defer claim).
   */
  beginAttempt(): boolean {
    if (!this.canClaimAttempt()) {
      this.logCapHit('attempt');
      return false;
    }
    this.activeAttempts += 1;
    return true;
  }

  endAttempt(): void {
    if (this.activeAttempts > 0) {
      this.activeAttempts -= 1;
    }
  }

  /**
   * Reserve one Chromium session (portal or mail) before `chromium.launch`.
   * Returns false when session budget is exhausted.
   */
  tryAcquireSession(kind: BrowserSessionKind): boolean {
    if (this.activeSessions >= this.maxSessionsPerWorker) {
      this.logCapHit(kind);
      return false;
    }
    this.activeSessions += 1;
    this.logger.log(
      `browser_session_acquired kind=${kind} activeSessions=${this.activeSessions} maxSessions=${this.maxSessionsPerWorker} activeAttempts=${this.activeAttempts}`,
    );
    return true;
  }

  releaseSession(kind: BrowserSessionKind): void {
    if (this.activeSessions > 0) {
      this.activeSessions -= 1;
    }
    this.logger.log(
      `browser_session_released kind=${kind} activeSessions=${this.activeSessions} maxSessions=${this.maxSessionsPerWorker} activeAttempts=${this.activeAttempts}`,
    );
  }

  private logCapHit(scope: BrowserSessionKind | 'attempt'): void {
    this.logger.warn(
      `${PORTAL_CONCURRENCY_CAP_HIT} scope=${scope} activeAttempts=${this.activeAttempts} maxAttempts=${this.maxAttemptsPerWorker} activeSessions=${this.activeSessions} maxSessions=${this.maxSessionsPerWorker}`,
    );
  }
}
