/**
 * Post-pass captcha chain: wait → same-kind probe → follow-up solve (DEC-001).
 * CapMonster stays single-solve; this util owns multi-captcha looping.
 */
import { Logger } from '@nestjs/common';
import { isCapMonsterCaptchaUnsolvableError } from '../../capmonster/utils/is-capmonster-captcha-unsolvable-error.util';
import { isCapMonsterClientError } from '../../capmonster/utils/is-capmonster-client-error.util';
import {
  PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON,
  PORTAL_CAPMONSTER_TRANSIENT_BACKOFF_MS,
  PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES,
  PORTAL_CAPMONSTER_UNSOLVABLE_TRIES_EXHAUSTED_ERROR_CODE,
  PORTAL_CAPMONSTER_UNSOLVABLE_TRIES_EXHAUSTED_MESSAGE,
  PORTAL_CAPTCHA_CHAIN_MAX_FOLLOW_UPS,
  PORTAL_CAPTCHA_CHAIN_WAIT_AFTER_PASS_MS,
  PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
  PORTAL_FILL_ABORTED_ERROR,
  PORTAL_LOGIN_CREDENTIALS_ENSURE_FAILED_REASON,
} from '../constants';
import type {
  PortalPage,
  RunPortalCaptchaChainAfterPassInput,
  RunPortalCaptchaChainAfterPassResult,
} from '../types';
import { assertCaptchaCircuitAllowsCall } from './assert-captcha-circuit-allows-call.util';
import { computePortalCapmonsterUnsolvableBackoffMs } from './compute-portal-capmonster-unsolvable-backoff-ms.util';
import { ensurePortalLoginCredentialsForCaptcha } from './ensure-portal-login-credentials-for-captcha.util';
import { isPortalCaptchaSameKindChallengePresent } from './is-portal-captcha-same-kind-challenge-present.util';
import { isPortalFillAbortRequested } from './is-portal-fill-abort-requested.util';
import { isPortalPasswordChangeFormVisibleAfterNav } from './is-portal-password-change-form-visible-after-nav.util';
import { solvePortalBlsCaptcha } from './portal-captcha-solve.util';
import { portalCaptchaVerifiedLoopSleep } from './portal-captcha-verified-loop-sleep.util';
import { recordCaptchaCircuitFailure } from './record-captcha-circuit-failure.util';
import { recordCaptchaCircuitSuccess } from './record-captcha-circuit-success.util';
import { waitPortalCaptchaChainAfterPassMs } from './wait-portal-captcha-chain-after-pass-ms.util';
import { waitPortalCaptchaVerifiedLoopMs } from './wait-portal-captcha-verified-loop-ms.util';

const logger = new Logger('PortalCaptchaChain');

/** Max successful applies in one chain = first pass + max follow-ups (DEC-002). */
const CHAIN_MAX_SUCCESSFUL_APPLIES = 1 + PORTAL_CAPTCHA_CHAIN_MAX_FOLLOW_UPS;

export const runPortalCaptchaChainAfterPass = async (
  page: PortalPage,
  input: RunPortalCaptchaChainAfterPassInput,
): Promise<RunPortalCaptchaChainAfterPassResult> => {
  let successfulApplies = input.successfulApplies;
  let unsolvableTries = input.unsolvableTries;
  const { attempts, logPrefix, attempt, breaker } = input;
  const acceptLoginAuthSuccess = input.acceptLoginAuthSuccess === true;

  // Round index for logs: 0 = after first pass, before first follow-up probe.
  let chainRound = 0;

  for (;;) {
    const remainingBeforeWait = input.remainingMs();
    if (remainingBeforeWait <= 0) {
      logger.error(
        `${logPrefix} phase=captcha_chain stopReason=budget_exhausted round=${chainRound} applies=${successfulApplies} attempts=${attempts}`,
      );
      await input.onAttemptCheckpoint({ attempts });
      return {
        kind: 'episode_stop',
        stopReason: 'budget_exhausted',
        attempts,
        unsolvableTries,
        error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
      };
    }

    // DEC-007 / DEC-008: always full chain wait (capped by remaining), abort-aware.
    // 010 DEC-002: when login-auth, poll for Change Password instead of blind sleep.
    const waitMs = Math.min(
      PORTAL_CAPTCHA_CHAIN_WAIT_AFTER_PASS_MS,
      remainingBeforeWait,
    );
    logger.log(
      `${logPrefix} phase=captcha_chain round=${chainRound} applies=${successfulApplies} waiting_after_pass waitMs=${waitMs} acceptLoginAuthSuccess=${acceptLoginAuthSuccess}`,
    );

    if (acceptLoginAuthSuccess) {
      const waitOutcome = await waitPortalCaptchaChainAfterPassMs(page, waitMs, {
        remainingMs: input.remainingMs,
        abortSignal: input.abortSignal,
      });

      if (waitOutcome === 'password_change_landing') {
        logger.log(
          `${logPrefix} phase=captcha_chain stopReason=password_change_landing round=${chainRound} applies=${successfulApplies}`,
        );
        return {
          kind: 'chain_ended',
          endReason: 'password_change_landing',
          unsolvableTries,
        };
      }

      if (waitOutcome === 'aborted') {
        logger.log(
          `${logPrefix} phase=captcha_chain stopReason=aborted round=${chainRound} applies=${successfulApplies} attempts=${attempts}`,
        );
        await input.onAttemptCheckpoint({ attempts });
        return {
          kind: 'episode_stop',
          stopReason: 'aborted',
          attempts,
          unsolvableTries,
          error: PORTAL_FILL_ABORTED_ERROR,
        };
      }

      if (waitOutcome === 'budget_exhausted') {
        logger.error(
          `${logPrefix} phase=captcha_chain stopReason=budget_exhausted round=${chainRound} applies=${successfulApplies} attempts=${attempts}`,
        );
        await input.onAttemptCheckpoint({ attempts });
        return {
          kind: 'episode_stop',
          stopReason: 'budget_exhausted',
          attempts,
          unsolvableTries,
          error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
        };
      }
    } else {
      await waitPortalCaptchaVerifiedLoopMs(waitMs, input.abortSignal);

      if (isPortalFillAbortRequested(input.abortSignal)) {
        logger.log(
          `${logPrefix} phase=captcha_chain stopReason=aborted round=${chainRound} applies=${successfulApplies} attempts=${attempts}`,
        );
        await input.onAttemptCheckpoint({ attempts });
        return {
          kind: 'episode_stop',
          stopReason: 'aborted',
          attempts,
          unsolvableTries,
          error: PORTAL_FILL_ABORTED_ERROR,
        };
      }

      if (input.remainingMs() <= 0) {
        logger.error(
          `${logPrefix} phase=captcha_chain stopReason=budget_exhausted round=${chainRound} applies=${successfulApplies} attempts=${attempts}`,
        );
        await input.onAttemptCheckpoint({ attempts });
        return {
          kind: 'episode_stop',
          stopReason: 'budget_exhausted',
          attempts,
          unsolvableTries,
          error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
        };
      }
    }

    // Pre-probe: Change Password already visible → skip same-kind probe (010 DEC-002).
    if (
      acceptLoginAuthSuccess &&
      (await isPortalPasswordChangeFormVisibleAfterNav(page))
    ) {
      logger.log(
        `${logPrefix} phase=captcha_chain stopReason=password_change_landing round=${chainRound} applies=${successfulApplies} stage=pre_probe`,
      );
      return {
        kind: 'chain_ended',
        endReason: 'password_change_landing',
        unsolvableTries,
      };
    }

    const remainingBeforeProbe = input.remainingMs();
    if (remainingBeforeProbe <= 0) {
      logger.error(
        `${logPrefix} phase=captcha_chain stopReason=budget_exhausted round=${chainRound} applies=${successfulApplies} attempts=${attempts}`,
      );
      await input.onAttemptCheckpoint({ attempts });
      return {
        kind: 'episode_stop',
        stopReason: 'budget_exhausted',
        attempts,
        unsolvableTries,
        error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
      };
    }

    const present = await isPortalCaptchaSameKindChallengePresent(page, {
      waitTimeoutMs: remainingBeforeProbe,
    });

    if (!present) {
      logger.log(
        `${logPrefix} phase=captcha_chain stopReason=no_challenge round=${chainRound} applies=${successfulApplies}`,
      );
      return {
        kind: 'chain_ended',
        endReason: 'no_challenge',
        unsolvableTries,
      };
    }

    if (successfulApplies >= CHAIN_MAX_SUCCESSFUL_APPLIES) {
      // DEC-005: log chain_limit, then Verified path — no false success / new permanent.
      logger.log(
        `${logPrefix} phase=captcha_chain stopReason=chain_limit round=${chainRound} applies=${successfulApplies} maxApplies=${CHAIN_MAX_SUCCESSFUL_APPLIES}`,
      );
      return {
        kind: 'chain_ended',
        endReason: 'chain_limit',
        unsolvableTries,
      };
    }

    // Follow-up solve with free unsolvable re-submit (stay on this challenge; no extra chain wait).
    for (;;) {
      const remainingBeforeSolve = input.remainingMs();
      if (remainingBeforeSolve <= 0) {
        logger.error(
          `${logPrefix} phase=captcha_chain stopReason=budget_exhausted round=${chainRound} applies=${successfulApplies} attempts=${attempts}`,
        );
        await input.onAttemptCheckpoint({ attempts });
        return {
          kind: 'episode_stop',
          stopReason: 'budget_exhausted',
          attempts,
          unsolvableTries,
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
          `${logPrefix} phase=captcha_chain stopReason=circuit_open round=${chainRound} applies=${successfulApplies} attempts=${attempts} circuit=${breaker.state}`,
        );
        await input.onAttemptCheckpoint({ attempts });
        return {
          kind: 'episode_stop',
          stopReason: 'circuit_open',
          attempts,
          unsolvableTries,
          error,
        };
      }

      await input.onHeartbeat?.().catch(() => undefined);

      // Credential ensure before each follow-up solve (DEC-001 / DEC-006 / RISK-001).
      const credentialsSupplied =
        (input.portalFormEmail?.trim() ?? '').length > 0 ||
        (input.portalPassword?.trim() ?? '').length > 0;
      if (credentialsSupplied) {
        const ensureResult = await ensurePortalLoginCredentialsForCaptcha(
          page,
          {
            portalFormEmail: input.portalFormEmail,
            portalPassword: input.portalPassword,
          },
        );
        if (!ensureResult.ok) {
          const error =
            ensureResult.reason ?? PORTAL_LOGIN_CREDENTIALS_ENSURE_FAILED_REASON;
          logger.error(
            `${logPrefix} phase=captcha_chain stopReason=credential_ensure_failed round=${chainRound} applies=${successfulApplies} ${error}`,
          );
          await input.onAttemptCheckpoint({ attempts });
          return {
            kind: 'episode_stop',
            stopReason: 'credential_ensure_failed',
            attempts,
            unsolvableTries,
            error,
          };
        }
      }

      const nextApply = successfulApplies + 1;
      const attemptTimeoutMs = Math.min(input.timeoutMs, remainingBeforeSolve);
      logger.log(
        `${logPrefix} phase=captcha_chain round=${chainRound} followUpApply=${nextApply}/${CHAIN_MAX_SUCCESSFUL_APPLIES} solving`,
      );

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
        unsolvableTries = 0;
        successfulApplies += 1;
        chainRound += 1;
        logger.log(
          `${logPrefix} phase=captcha_chain round=${chainRound} applies=${successfulApplies} follow_up_success circuit=closed`,
        );
        // DEC-003: successful follow-ups do not burn outer attempts.
        await input.onAttemptCheckpoint({ attempts });
        break; // back to post-pass wait → probe
      } catch (err) {
        if (isCapMonsterCaptchaUnsolvableError(err)) {
          unsolvableTries += 1;
          logger.warn(
            `${logPrefix} phase=captcha_chain round=${chainRound} capmonster_unsolvable non_attempt_burning try=${unsolvableTries}/${PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES} phase=${err.phase}${err.errorCode ? ` errorCode=${err.errorCode}` : ''} circuit=${breaker.state} cbOutcome=skipped`,
          );
          await input.onAttemptCheckpoint({ attempts });

          if (unsolvableTries >= PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES) {
            logger.error(
              `${logPrefix} phase=captcha_chain stopReason=capmonster_unsolvable_exhausted try=${unsolvableTries}/${PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES} attempts=${attempts} errorCode=${PORTAL_CAPMONSTER_UNSOLVABLE_TRIES_EXHAUSTED_ERROR_CODE}`,
            );
            await input.onAttemptCheckpoint({ attempts });
            return {
              kind: 'episode_stop',
              stopReason: 'capmonster_unsolvable_exhausted',
              attempts,
              unsolvableTries,
              errorCode: PORTAL_CAPMONSTER_UNSOLVABLE_TRIES_EXHAUSTED_ERROR_CODE,
              error: PORTAL_CAPMONSTER_UNSOLVABLE_TRIES_EXHAUSTED_MESSAGE,
            };
          }

          const remainingBeforeBackoff = input.remainingMs();
          if (remainingBeforeBackoff <= 0) {
            logger.error(
              `${logPrefix} phase=captcha_chain stopReason=budget_exhausted attempts=${attempts}`,
            );
            await input.onAttemptCheckpoint({ attempts });
            return {
              kind: 'episode_stop',
              stopReason: 'budget_exhausted',
              attempts,
              unsolvableTries,
              error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
            };
          }

          const computedWaitMs =
            computePortalCapmonsterUnsolvableBackoffMs(unsolvableTries);
          const unsolvableWaitMs = Math.min(
            computedWaitMs,
            remainingBeforeBackoff,
          );
          logger.log(
            `${logPrefix} phase=captcha_chain unsolvable_backoff try=${unsolvableTries}/${PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES} waitMs=${unsolvableWaitMs} computedWaitMs=${computedWaitMs} remainingMs=${remainingBeforeBackoff}`,
          );
          await waitPortalCaptchaVerifiedLoopMs(
            unsolvableWaitMs,
            input.abortSignal,
          );

          if (isPortalFillAbortRequested(input.abortSignal)) {
            logger.log(
              `${logPrefix} phase=captcha_chain stopReason=aborted try=${unsolvableTries}/${PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES} attempts=${attempts}`,
            );
            await input.onAttemptCheckpoint({ attempts });
            return {
              kind: 'episode_stop',
              stopReason: 'aborted',
              attempts,
              unsolvableTries,
              error: PORTAL_FILL_ABORTED_ERROR,
            };
          }

          if (input.remainingMs() <= 0) {
            logger.error(
              `${logPrefix} phase=captcha_chain stopReason=budget_exhausted attempts=${attempts}`,
            );
            await input.onAttemptCheckpoint({ attempts });
            return {
              kind: 'episode_stop',
              stopReason: 'budget_exhausted',
              attempts,
              unsolvableTries,
              error: PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON,
            };
          }

          // Free re-submit: retry this follow-up solve (no successful pass; no chain wait).
          continue;
        }

        if (isCapMonsterClientError(err)) {
          const failure = recordCaptchaCircuitFailure(
            breaker,
            err.failureClass,
            Date.now(),
          );
          logger.error(
            `${logPrefix} phase=captcha_chain round=${chainRound} attempt=${attempt} capmonster_failure class=${err.failureClass} phase=${err.phase}${err.errorCode ? ` errorCode=${err.errorCode}` : ''} circuit=${breaker.state} cbOutcome=${failure.outcome}`,
          );

          if (failure.outcome === 'fail_fast') {
            await input.onAttemptCheckpoint({
              attempts,
              permanentFailed: true,
            });
            return {
              kind: 'episode_stop',
              stopReason: 'permanent',
              attempts,
              unsolvableTries,
              permanentFailed: true,
              error: `captcha service permanent failure: ${err.message}`,
            };
          }

          if (failure.outcome === 'circuit_open') {
            await input.onAttemptCheckpoint({ attempts });
            return {
              kind: 'episode_stop',
              stopReason: 'circuit_open',
              attempts,
              unsolvableTries,
              error: `${PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON} (after transient captcha service failures)`,
            };
          }

          await input.onAttemptCheckpoint({ attempts });
          await portalCaptchaVerifiedLoopSleep(
            PORTAL_CAPMONSTER_TRANSIENT_BACKOFF_MS,
          );
          // Burnable transient: leave chain; outer attempt already burned (DEC-003).
          return {
            kind: 'continue_outer',
            attempts,
            unsolvableTries,
          };
        }

        const portalError = err instanceof Error ? err.message : String(err);
        logger.warn(
          `${logPrefix} phase=captcha_chain round=${chainRound} attempt=${attempt} portal_solve_failure ${portalError}`,
        );
        await input.onAttemptCheckpoint({ attempts });
        return {
          kind: 'continue_outer',
          attempts,
          unsolvableTries,
        };
      }
    }
  }
};
