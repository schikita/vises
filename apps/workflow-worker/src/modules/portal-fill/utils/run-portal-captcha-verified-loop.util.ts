import { Logger } from '@nestjs/common';
import { isCapMonsterCaptchaUnsolvableError } from '../../capmonster/utils/is-capmonster-captcha-unsolvable-error.util';
import { isCapMonsterClientError } from '../../capmonster/utils/is-capmonster-client-error.util';
import {
  PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON,
  PORTAL_CAPMONSTER_TRANSIENT_BACKOFF_MS,
  PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES,
  PORTAL_CAPMONSTER_UNSOLVABLE_TRIES_EXHAUSTED_ERROR_CODE,
  PORTAL_CAPMONSTER_UNSOLVABLE_TRIES_EXHAUSTED_MESSAGE,
  PORTAL_CAPTCHA_VERIFIED_AFTER_APPLY_POLL_MS,
  PORTAL_CAPTCHA_VERIFIED_AFTER_APPLY_WAIT_MS,
  PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
  PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS,
  PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS,
  PORTAL_FILL_ABORTED_ERROR,
  PORTAL_LOGIN_CREDENTIALS_ENSURE_FAILED_REASON,
  PORTAL_LOGIN_SITE_PROCESSING_ERROR_CODE,
  PORTAL_LOGIN_SITE_PROCESSING_ERROR_MESSAGE,
} from '../constants';
import type {
  PortalPage,
  RunPortalCaptchaVerifiedLoopInput,
  RunPortalCaptchaVerifiedLoopResult,
} from '../types';
import { assertCaptchaCircuitAllowsCall } from './assert-captcha-circuit-allows-call.util';
import { computePortalCapmonsterUnsolvableBackoffMs } from './compute-portal-capmonster-unsolvable-backoff-ms.util';
import { createCaptchaCircuitBreaker } from './create-captcha-circuit-breaker.util';
import { detectPortalLoginSiteProcessingAlert } from './detect-portal-login-site-processing-alert.util';
import { ensurePortalCaptchaChallengeReady } from './ensure-portal-captcha-challenge-ready.util';
import { ensurePortalLoginCredentialsForCaptcha } from './ensure-portal-login-credentials-for-captcha.util';
import { formatPortalLogContext } from '../../portal-core/utils/format-portal-log-context.util';
import { isPortalBookingCaptchaSurfaceVisible } from './is-portal-booking-captcha-surface-visible.util';
import { isPortalCaptchaVerifiedAfterNav } from './is-portal-captcha-verified-after-nav.util';
import { isPortalFillAbortRequested } from './is-portal-fill-abort-requested.util';
import { isPortalLoginFormVisibleAfterNav } from './is-portal-login-form-visible-after-nav.util';
import { isPortalPasswordChangeFormVisibleAfterNav } from './is-portal-password-change-form-visible-after-nav.util';
import { portalCaptchaVerifiedLoopSleep } from './portal-captcha-verified-loop-sleep.util';
import { solvePortalBlsCaptcha } from './portal-captcha-solve.util';
import { recordCaptchaCircuitFailure } from './record-captcha-circuit-failure.util';
import { recordCaptchaCircuitSuccess } from './record-captcha-circuit-success.util';
import { runPortalCaptchaChainAfterPass } from './run-portal-captcha-chain-after-pass.util';
import { waitForPortalCaptchaEpisodeSuccess } from './wait-for-portal-captcha-episode-success.util';
import { waitPortalCaptchaVerifiedLoopMs } from './wait-portal-captcha-verified-loop-ms.util';

const logger = new Logger('PortalCaptchaVerifiedLoop');

/**
 * Bounded Verified wait/retry loop (REQ-001–007, DEC-002/003/004/005/007/008).
 * Pipeline owns the initial `#btnVerify`; this util owns adaptive Verify, CB, and budgets.
 * On resume: restore attempt count, absolute deadline, and CB (DEC-003); never blank-slate.
 *
 * CapMonster `ERROR_CAPTCHA_UNSOLVABLE` is a free re-submit (prior DEC-003/004): no
 * attempt burn, no CB failure recorder. Bounded by wall-clock and a hard
 * `PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES` ceiling (ten-retry DEC-001/003/006).
 * In-budget unsolvables use progressive linear backoff (DEC-010–013); other
 * CapMonster transient keeps fixed `PORTAL_CAPMONSTER_TRANSIENT_BACKOFF_MS`.
 * Attempt index advances only on burnable outcomes (portal ensure/solve, CapMonster
 * non-unsolvable transient, wrong-answer / Verified wait path).
 *
 * After each successful first solve-apply, runs the post-pass captcha chain
 * (capmonster-chained-captcha DEC-001–008): wait → same-kind probe → follow-ups
 * before `#btnVerified` success. CapMonster HTTP remains single-solve.
 */
export const runPortalCaptchaVerifiedLoop = async (
  page: PortalPage,
  input: RunPortalCaptchaVerifiedLoopInput,
): Promise<RunPortalCaptchaVerifiedLoopResult> => {
  const breaker =
    input.restoredCircuit ?? createCaptchaCircuitBreaker();
  let attempts = Math.max(0, input.restoredAttempts ?? 0);
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
      attempts: opts?.attempts ?? attempts,
      budgetDeadlineAt,
      circuit: breaker,
      permanentFailed: opts?.permanentFailed,
      inflightTaskId: null,
    });
  };

  const remainingMs = () => budgetDeadlineAt.getTime() - Date.now();
  const acceptLoginAuthSuccess = input.acceptLoginAuthSuccess === true;
  const acceptBookingSurfaceDismiss =
    input.acceptBookingSurfaceDismiss === true;

  if (
    acceptBookingSurfaceDismiss &&
    !(await isPortalBookingCaptchaSurfaceVisible(page))
  ) {
    logger.log(
      `${logPrefix} phase=captcha_verified_loop success attempts=${attempts} reason=already_verified via=booking_surface_dismiss`,
    );
    await emitCheckpoint({ attempts });
    return { ok: true, attempts, stopReason: 'verified' };
  }

  if (
    !acceptBookingSurfaceDismiss &&
    (await isPortalCaptchaVerifiedAfterNav(page))
  ) {
    logger.log(
      `${logPrefix} phase=captcha_verified_loop success attempts=${attempts} reason=already_verified via=btnVerified`,
    );
    await emitCheckpoint({ attempts });
    return { ok: true, attempts, stopReason: 'verified' };
  }

  if (
    acceptLoginAuthSuccess &&
    (await isPortalPasswordChangeFormVisibleAfterNav(page))
  ) {
    logger.log(
      `${logPrefix} phase=captcha_verified_loop success attempts=${attempts} reason=already_verified via=password_change`,
    );
    await emitCheckpoint({ attempts });
    return { ok: true, attempts, stopReason: 'verified' };
  }

  if (
    acceptLoginAuthSuccess &&
    !(await isPortalLoginFormVisibleAfterNav(page))
  ) {
    const siteError = await detectPortalLoginSiteProcessingAlert(page);
    if (siteError.present) {
      const alertSuffix = siteError.alertText
        ? ` alertText=${siteError.alertText.slice(0, 200)}`
        : '';
      logger.error(
        `${logPrefix} phase=captcha_verified_loop stop reason=login_site_processing_error attempts=${attempts}${alertSuffix}`,
      );
      await emitCheckpoint({ attempts });
      return {
        ok: false,
        attempts,
        stopReason: 'login_site_processing_error',
        errorCode: PORTAL_LOGIN_SITE_PROCESSING_ERROR_CODE,
        error: siteError.alertText
          ? `${PORTAL_LOGIN_SITE_PROCESSING_ERROR_MESSAGE} (${siteError.alertText.slice(0, 200)})`
          : PORTAL_LOGIN_SITE_PROCESSING_ERROR_MESSAGE,
      };
    }
    logger.log(
      `${logPrefix} phase=captcha_verified_loop success attempts=${attempts} reason=already_verified via=login_auth`,
    );
    await emitCheckpoint({ attempts });
    return { ok: true, attempts, stopReason: 'verified' };
  }

  if (attempts >= PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS) {
    logger.error(
      `${logPrefix} phase=captcha_verified_loop stop reason=budget_exhausted attempts=${attempts}`,
    );
    await emitCheckpoint({ attempts });
    return {
      ok: false,
      attempts,
      stopReason: 'budget_exhausted',
      error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
    };
  }

  if (remainingMs() <= 0) {
    logger.error(
      `${logPrefix} phase=captcha_verified_loop stop reason=budget_exhausted attempts=${attempts}`,
    );
    await emitCheckpoint({ attempts });
    return {
      ok: false,
      attempts,
      stopReason: 'budget_exhausted',
      error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
    };
  }

  // Persist restored / initial deadline + CB before first attempt of this process.
  await emitCheckpoint({ attempts });

  let lastPortalError: string | undefined;
  /** Consecutive CapMonster unsolvable tries this episode (DEC-007 in-process). */
  let unsolvableTries = 0;

  while (attempts < PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS) {
    const remainingOuterMs = remainingMs();
    if (remainingOuterMs <= 0) {
      logger.error(
        `${logPrefix} phase=captcha_verified_loop stop reason=budget_exhausted attempts=${attempts}`,
      );
      await emitCheckpoint({ attempts });
      return {
        ok: false,
        attempts,
        stopReason: 'budget_exhausted',
        error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
      };
    }

    // 1-based display / would-be burned index for this iteration (DEC-003).
    const attempt = attempts + 1;

    await input.onHeartbeat?.().catch(() => undefined);

    logger.log(
      `${logPrefix} phase=captcha_verified_loop attempt=${attempt}/${PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS} circuit=${breaker.state} remainingMs=${remainingOuterMs}`,
    );

    // Credential ensure before challenge ensure/solve (DEC-001 / DEC-006).
    const credentialsSupplied =
      (input.portalFormEmail?.trim() ?? '').length > 0 ||
      (input.portalPassword?.trim() ?? '').length > 0;
    if (credentialsSupplied) {
      const ensureResult = await ensurePortalLoginCredentialsForCaptcha(page, {
        portalFormEmail: input.portalFormEmail,
        portalPassword: input.portalPassword,
      });
      if (!ensureResult.ok) {
        const error =
          ensureResult.reason ?? PORTAL_LOGIN_CREDENTIALS_ENSURE_FAILED_REASON;
        logger.error(
          `${logPrefix} phase=captcha_verified_loop stop reason=credential_ensure_failed attempt=${attempt} ${error}`,
        );
        await emitCheckpoint({ attempts });
        return {
          ok: false,
          attempts,
          stopReason: 'credential_ensure_failed',
          error,
        };
      }
    }

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
      attempts = attempt;
      await emitCheckpoint({ attempts });
      continue;
    }

    const remainingBeforeSolve = remainingMs();
    if (remainingBeforeSolve <= 0) {
      attempts = attempt;
      logger.error(
        `${logPrefix} phase=captcha_verified_loop stop reason=budget_exhausted attempts=${attempts}`,
      );
      await emitCheckpoint({ attempts });
      return {
        ok: false,
        attempts,
        stopReason: 'budget_exhausted',
        error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
      };
    }

    try {
      assertCaptchaCircuitAllowsCall(breaker, Date.now());
    } catch (err) {
      const error =
        err instanceof Error
          ? err.message
          : PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON;
      logger.error(
        `${logPrefix} phase=captcha_verified_loop stop reason=circuit_open attempts=${attempt} circuit=${breaker.state}`,
      );
      attempts = attempt;
      await emitCheckpoint({ attempts });
      return {
        ok: false,
        attempts,
        stopReason: 'circuit_open',
        error,
      };
    }

    const attemptTimeoutMs = Math.min(input.timeoutMs, remainingBeforeSolve);

    try {
      await solvePortalBlsCaptcha(page, {
        captchaServiceApiKey: input.captchaServiceApiKey,
        timeoutMs: attemptTimeoutMs,
        pollIntervalMs: input.pollIntervalMs,
        waitTimeoutMs: attemptTimeoutMs,
        captchaProvider: input.captchaProvider,
        logContext: input.logContext,
      });
      recordCaptchaCircuitSuccess(breaker);
      // CapMonster ready ends the unsolvable streak for this episode (REQ-003).
      unsolvableTries = 0;
      logger.log(
        `${logPrefix} phase=captcha_verified_loop attempt=${attempt} capmonster_api success circuit=closed`,
      );
    } catch (err) {
      if (isCapMonsterCaptchaUnsolvableError(err)) {
        // Free re-submit: no CB, no attempt burn (DEC-004); try budget DEC-001/003.
        unsolvableTries += 1;
        logger.warn(
          `${logPrefix} phase=captcha_verified_loop attempt=${attempt} capmonster_unsolvable non_attempt_burning try=${unsolvableTries}/${PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES} phase=${err.phase}${err.errorCode ? ` errorCode=${err.errorCode}` : ''} circuit=${breaker.state} cbOutcome=skipped`,
        );
        await emitCheckpoint({ attempts });

        if (unsolvableTries >= PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES) {
          // REQ-013: no progressive wait after try-10 exhaustion.
          logger.error(
            `${logPrefix} phase=captcha_verified_loop stop reason=capmonster_unsolvable_exhausted try=${unsolvableTries}/${PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES} attempts=${attempts} errorCode=${PORTAL_CAPMONSTER_UNSOLVABLE_TRIES_EXHAUSTED_ERROR_CODE} permanent=false`,
          );
          await emitCheckpoint({ attempts });
          return {
            ok: false,
            attempts,
            stopReason: 'capmonster_unsolvable_exhausted',
            errorCode: PORTAL_CAPMONSTER_UNSOLVABLE_TRIES_EXHAUSTED_ERROR_CODE,
            error: PORTAL_CAPMONSTER_UNSOLVABLE_TRIES_EXHAUSTED_MESSAGE,
          };
        }

        const remainingBeforeBackoff = remainingMs();
        if (remainingBeforeBackoff <= 0) {
          logger.error(
            `${logPrefix} phase=captcha_verified_loop stop reason=budget_exhausted attempts=${attempts}`,
          );
          await emitCheckpoint({ attempts });
          return {
            ok: false,
            attempts,
            stopReason: 'budget_exhausted',
            error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
          };
        }

        // Progressive unsolvable backoff only (DEC-010/011/013); not fixed 2s.
        const computedWaitMs =
          computePortalCapmonsterUnsolvableBackoffMs(unsolvableTries);
        const waitMs = Math.min(computedWaitMs, remainingBeforeBackoff);
        logger.log(
          `${logPrefix} phase=captcha_verified_loop unsolvable_backoff try=${unsolvableTries}/${PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES} waitMs=${waitMs} computedWaitMs=${computedWaitMs} remainingMs=${remainingBeforeBackoff}`,
        );
        await waitPortalCaptchaVerifiedLoopMs(waitMs, input.abortSignal);

        if (isPortalFillAbortRequested(input.abortSignal)) {
          logger.log(
            `${logPrefix} phase=captcha_verified_loop stop reason=aborted try=${unsolvableTries}/${PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES} attempts=${attempts} permanent=false`,
          );
          await emitCheckpoint({ attempts });
          return {
            ok: false,
            attempts,
            stopReason: 'aborted',
            error: PORTAL_FILL_ABORTED_ERROR,
          };
        }

        if (remainingMs() <= 0) {
          logger.error(
            `${logPrefix} phase=captcha_verified_loop stop reason=budget_exhausted attempts=${attempts}`,
          );
          await emitCheckpoint({ attempts });
          return {
            ok: false,
            attempts,
            stopReason: 'budget_exhausted',
            error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
          };
        }
        continue;
      }

      if (isCapMonsterClientError(err)) {
        const failure = recordCaptchaCircuitFailure(
          breaker,
          err.failureClass,
          Date.now(),
        );
        logger.error(
          `${logPrefix} phase=captcha_verified_loop attempt=${attempt} capmonster_failure class=${err.failureClass} phase=${err.phase}${err.errorCode ? ` errorCode=${err.errorCode}` : ''} circuit=${breaker.state} cbOutcome=${failure.outcome}`,
        );

        if (failure.outcome === 'fail_fast') {
          attempts = attempt;
          await emitCheckpoint({
            attempts,
            permanentFailed: true,
          });
          return {
            ok: false,
            attempts,
            stopReason: 'permanent',
            error: `captcha service permanent failure: ${err.message}`,
          };
        }

        if (failure.outcome === 'circuit_open') {
          attempts = attempt;
          await emitCheckpoint({ attempts });
          return {
            ok: false,
            attempts,
            stopReason: 'circuit_open',
            error: `${PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON} (after transient captcha service failures)`,
          };
        }

        attempts = attempt;
        await emitCheckpoint({ attempts });
        // Non-unsolvable CapMonster transient keeps fixed 2s (REQ-015).
        await portalCaptchaVerifiedLoopSleep(
          PORTAL_CAPMONSTER_TRANSIENT_BACKOFF_MS,
        );
        continue;
      }

      lastPortalError = err instanceof Error ? err.message : String(err);
      logger.warn(
        `${logPrefix} phase=captcha_verified_loop attempt=${attempt} portal_solve_failure ${lastPortalError}`,
      );
      attempts = attempt;
      await emitCheckpoint({ attempts });
      continue;
    }

    // DEC-003 (chain): burn outer attempt once after first successful apply;
    // successful follow-ups in the chain do not increment attempts.
    attempts = attempt;
    await emitCheckpoint({ attempts });

    const chainResult = await runPortalCaptchaChainAfterPass(page, {
      captchaServiceApiKey: input.captchaServiceApiKey,
      timeoutMs: input.timeoutMs,
      pollIntervalMs: input.pollIntervalMs,
      captchaProvider: input.captchaProvider,
      logContext: input.logContext,
      logPrefix,
      attempt,
      successfulApplies: 1,
      attempts,
      breaker,
      remainingMs,
      abortSignal: input.abortSignal,
      acceptLoginAuthSuccess,
      unsolvableTries,
      onHeartbeat: input.onHeartbeat,
      onAttemptCheckpoint: emitCheckpoint,
      portalFormEmail: input.portalFormEmail,
      portalPassword: input.portalPassword,
    });
    unsolvableTries = chainResult.unsolvableTries;

    if (chainResult.kind === 'episode_stop') {
      return {
        ok: false,
        attempts: chainResult.attempts,
        stopReason: chainResult.stopReason,
        error: chainResult.error,
        errorCode: chainResult.errorCode,
      };
    }

    if (chainResult.kind === 'continue_outer') {
      attempts = chainResult.attempts;
      logger.log(
        `${logPrefix} phase=captcha_verified_loop attempt=${attempt} chain_burnable_failure continuing`,
      );
      continue;
    }

    // chain_ended (no_challenge | chain_limit): episode success wait (REQ-008).
    logger.log(
      `${logPrefix} phase=captcha_verified_loop attempt=${attempt} chain_ended reason=${chainResult.endReason}`,
    );

    // Dedicated wait: booking surface dismiss, #btnVerified, and/or login auth.
    const remainingAfterChain = remainingMs();
    if (remainingAfterChain <= 0) {
      logger.error(
        `${logPrefix} phase=captcha_verified_loop stop reason=budget_exhausted attempts=${attempts}`,
      );
      await emitCheckpoint({ attempts });
      return {
        ok: false,
        attempts,
        stopReason: 'budget_exhausted',
        error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
      };
    }

    const waitMs = Math.min(
      remainingAfterChain,
      PORTAL_CAPTCHA_VERIFIED_AFTER_APPLY_WAIT_MS,
    );
    logger.log(
      `${logPrefix} phase=captcha_verified_loop attempt=${attempt} waiting_for_episode_success waitMs=${waitMs} acceptLoginAuthSuccess=${acceptLoginAuthSuccess} acceptBookingSurfaceDismiss=${acceptBookingSurfaceDismiss}`,
    );

    const episode = await waitForPortalCaptchaEpisodeSuccess(
      page,
      waitMs,
      PORTAL_CAPTCHA_VERIFIED_AFTER_APPLY_POLL_MS,
      { acceptLoginAuthSuccess, acceptBookingSurfaceDismiss },
    );

    if (episode.ok) {
      logger.log(
        `${logPrefix} phase=captcha_verified_loop success attempts=${attempts} reason=verified via=${episode.via ?? 'btnVerified'}`,
      );
      await emitCheckpoint({ attempts });
      return { ok: true, attempts, stopReason: 'verified' };
    }

    if (acceptLoginAuthSuccess) {
      const siteError = await detectPortalLoginSiteProcessingAlert(page);
      if (siteError.present) {
        const alertSuffix = siteError.alertText
          ? ` alertText=${siteError.alertText.slice(0, 200)}`
          : '';
        logger.error(
          `${logPrefix} phase=captcha_verified_loop stop reason=login_site_processing_error attempt=${attempt}${alertSuffix}`,
        );
        await emitCheckpoint({ attempts });
        return {
          ok: false,
          attempts,
          stopReason: 'login_site_processing_error',
          errorCode: PORTAL_LOGIN_SITE_PROCESSING_ERROR_CODE,
          error: siteError.alertText
            ? `${PORTAL_LOGIN_SITE_PROCESSING_ERROR_MESSAGE} (${siteError.alertText.slice(0, 200)})`
            : PORTAL_LOGIN_SITE_PROCESSING_ERROR_MESSAGE,
        };
      }
    }

    logger.log(
      `${logPrefix} phase=captcha_verified_loop attempt=${attempt} verified=false continuing`,
    );
    await emitCheckpoint({ attempts });
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
