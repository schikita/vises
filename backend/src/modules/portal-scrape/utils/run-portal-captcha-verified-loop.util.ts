import { Logger } from '@nestjs/common';
import { isCapMonsterClientError } from '../../capmonster';
import {
  PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON,
  PORTAL_CAPMONSTER_TRANSIENT_BACKOFF_MS,
  PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
  PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS,
  PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS,
  PORTAL_CAPTCHA_VERIFIED_SETTLE_MS,
} from '../constants';
import type {
  PortalPage,
  RunPortalCaptchaVerifiedLoopInput,
  RunPortalCaptchaVerifiedLoopResult,
} from '../types';
import { assertCapMonsterCircuitAllowsCall } from './assert-capmonster-circuit-allows-call.util';
import { createCapMonsterCircuitBreaker } from './create-capmonster-circuit-breaker.util';
import { ensurePortalCaptchaChallengeReady } from './ensure-portal-captcha-challenge-ready.util';
import { formatPortalLogContext } from './format-portal-log-context.util';
import { isPortalCaptchaVerified } from './is-portal-captcha-verified.util';
import { portalCaptchaVerifiedLoopSleep } from './portal-captcha-verified-loop-sleep.util';
import { solvePortalBlsCaptcha } from './portal-captcha-solve.util';
import { recordCapMonsterCircuitFailure } from './record-capmonster-circuit-failure.util';
import { recordCapMonsterCircuitSuccess } from './record-capmonster-circuit-success.util';

const logger = new Logger('PortalCaptchaVerifiedLoop');

/**
 * Bounded Verified wait/retry loop (REQ-001–007, DEC-002/003/004/005/007/008).
 * Pipeline owns the initial `#btnVerify`; this util owns adaptive Verify, CB, and budgets.
 * On resume: restore attempt count, absolute deadline, and CB (DEC-003); never blank-slate.
 */
export const runPortalCaptchaVerifiedLoop = async (
  page: PortalPage,
  input: RunPortalCaptchaVerifiedLoopInput,
): Promise<RunPortalCaptchaVerifiedLoopResult> => {
  const breaker =
    input.restoredCircuit ?? createCapMonsterCircuitBreaker();
  const restoredAttempts = Math.max(0, input.restoredAttempts ?? 0);
  const budgetDeadlineAt =
    input.budgetDeadlineAt ??
    new Date(Date.now() + PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS);
  const logPrefix = input.logContext
    ? formatPortalLogContext(input.logContext)
    : '[captcha]';

  const emitCheckpoint = async (opts?: {
    attempts?: number;
    permanentFailed?: boolean;
  }) => {
    if (!input.onAttemptCheckpoint) {
      return;
    }
    await input.onAttemptCheckpoint({
      attempts: opts?.attempts ?? restoredAttempts,
      budgetDeadlineAt,
      circuit: breaker,
      permanentFailed: opts?.permanentFailed,
      inflightTaskId: null,
    });
  };

  const remainingMs = () => budgetDeadlineAt.getTime() - Date.now();

  if (await isPortalCaptchaVerified(page)) {
    logger.log(
      `${logPrefix} phase=captcha_verified_loop success attempts=${restoredAttempts} reason=already_verified`,
    );
    await emitCheckpoint({ attempts: restoredAttempts });
    return { ok: true, attempts: restoredAttempts, stopReason: 'verified' };
  }

  if (restoredAttempts >= PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS) {
    logger.error(
      `${logPrefix} phase=captcha_verified_loop stop reason=budget_exhausted attempts=${restoredAttempts}`,
    );
    await emitCheckpoint({ attempts: restoredAttempts });
    return {
      ok: false,
      attempts: restoredAttempts,
      stopReason: 'budget_exhausted',
      error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
    };
  }

  if (remainingMs() <= 0) {
    logger.error(
      `${logPrefix} phase=captcha_verified_loop stop reason=budget_exhausted attempts=${restoredAttempts}`,
    );
    await emitCheckpoint({ attempts: restoredAttempts });
    return {
      ok: false,
      attempts: restoredAttempts,
      stopReason: 'budget_exhausted',
      error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
    };
  }

  // Persist restored / initial deadline + CB before first attempt of this process.
  await emitCheckpoint({ attempts: restoredAttempts });

  let lastPortalError: string | undefined;

  for (
    let attempt = restoredAttempts + 1;
    attempt <= PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS;
    attempt += 1
  ) {
    const remainingOuterMs = remainingMs();
    if (remainingOuterMs <= 0) {
      logger.error(
        `${logPrefix} phase=captcha_verified_loop stop reason=budget_exhausted attempts=${attempt - 1}`,
      );
      await emitCheckpoint({ attempts: attempt - 1 });
      return {
        ok: false,
        attempts: attempt - 1,
        stopReason: 'budget_exhausted',
        error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
      };
    }

    await input.onHeartbeat?.().catch(() => undefined);

    logger.log(
      `${logPrefix} phase=captcha_verified_loop attempt=${attempt}/${PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS} circuit=${breaker.state} remainingMs=${remainingOuterMs}`,
    );

    try {
      await ensurePortalCaptchaChallengeReady(page, {
        waitTimeoutMs: remainingOuterMs,
        logPrefix,
      });
    } catch (err) {
      lastPortalError = err instanceof Error ? err.message : String(err);
      logger.warn(
        `${logPrefix} phase=captcha_verified_loop attempt=${attempt} portal_ensure_failure ${lastPortalError}`,
      );
      await emitCheckpoint({ attempts: attempt });
      continue;
    }

    const remainingBeforeSolve = remainingMs();
    if (remainingBeforeSolve <= 0) {
      logger.error(
        `${logPrefix} phase=captcha_verified_loop stop reason=budget_exhausted attempts=${attempt}`,
      );
      await emitCheckpoint({ attempts: attempt });
      return {
        ok: false,
        attempts: attempt,
        stopReason: 'budget_exhausted',
        error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
      };
    }

    try {
      assertCapMonsterCircuitAllowsCall(breaker, Date.now());
    } catch (err) {
      const error =
        err instanceof Error
          ? err.message
          : PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON;
      logger.error(
        `${logPrefix} phase=captcha_verified_loop stop reason=circuit_open attempts=${attempt} circuit=${breaker.state}`,
      );
      await emitCheckpoint({ attempts: attempt });
      return {
        ok: false,
        attempts: attempt,
        stopReason: 'circuit_open',
        error,
      };
    }

    const attemptTimeoutMs = Math.min(input.timeoutMs, remainingBeforeSolve);

    try {
      await solvePortalBlsCaptcha(page, {
        clientKey: input.clientKey,
        timeoutMs: attemptTimeoutMs,
        pollIntervalMs: input.pollIntervalMs,
        waitTimeoutMs: attemptTimeoutMs,
        capMonster: input.capMonster,
        logContext: input.logContext,
      });
      recordCapMonsterCircuitSuccess(breaker);
      logger.log(
        `${logPrefix} phase=captcha_verified_loop attempt=${attempt} capmonster_api success circuit=closed`,
      );
    } catch (err) {
      if (isCapMonsterClientError(err)) {
        const failure = recordCapMonsterCircuitFailure(
          breaker,
          err.failureClass,
          Date.now(),
        );
        logger.error(
          `${logPrefix} phase=captcha_verified_loop attempt=${attempt} capmonster_failure class=${err.failureClass} phase=${err.phase}${err.errorCode ? ` errorCode=${err.errorCode}` : ''} circuit=${breaker.state} cbOutcome=${failure.outcome}`,
        );

        if (failure.outcome === 'fail_fast') {
          await emitCheckpoint({
            attempts: attempt,
            permanentFailed: true,
          });
          return {
            ok: false,
            attempts: attempt,
            stopReason: 'permanent',
            error: `CapMonster permanent failure: ${err.message}`,
          };
        }

        if (failure.outcome === 'circuit_open') {
          await emitCheckpoint({ attempts: attempt });
          return {
            ok: false,
            attempts: attempt,
            stopReason: 'circuit_open',
            error: `${PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON} (after transient CapMonster failures)`,
          };
        }

        await emitCheckpoint({ attempts: attempt });
        await portalCaptchaVerifiedLoopSleep(
          PORTAL_CAPMONSTER_TRANSIENT_BACKOFF_MS,
        );
        continue;
      }

      lastPortalError = err instanceof Error ? err.message : String(err);
      logger.warn(
        `${logPrefix} phase=captcha_verified_loop attempt=${attempt} portal_solve_failure ${lastPortalError}`,
      );
      await emitCheckpoint({ attempts: attempt });
      continue;
    }

    await portalCaptchaVerifiedLoopSleep(PORTAL_CAPTCHA_VERIFIED_SETTLE_MS);

    if (await isPortalCaptchaVerified(page)) {
      logger.log(
        `${logPrefix} phase=captcha_verified_loop success attempts=${attempt} reason=verified`,
      );
      await emitCheckpoint({ attempts: attempt });
      return { ok: true, attempts: attempt, stopReason: 'verified' };
    }

    logger.log(
      `${logPrefix} phase=captcha_verified_loop attempt=${attempt} verified=false continuing`,
    );
    await emitCheckpoint({ attempts: attempt });
  }

  const error =
    lastPortalError !== undefined
      ? `${PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON}: ${lastPortalError}`
      : PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON;
  logger.error(
    `${logPrefix} phase=captcha_verified_loop stop reason=budget_exhausted attempts=${PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS}`,
  );
  await emitCheckpoint({
    attempts: PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS,
  });
  return {
    ok: false,
    attempts: PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS,
    stopReason: lastPortalError !== undefined ? 'portal_error' : 'budget_exhausted',
    error,
  };
};
