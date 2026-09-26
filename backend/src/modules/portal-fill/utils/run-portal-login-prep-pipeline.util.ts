import { Logger } from '@nestjs/common';
import {
  PORTAL_CAPMONSTER_POLL_INTERVAL_MS,
  PORTAL_CAPMONSTER_TIMEOUT_MS,
} from '../../capmonster/constants/capmonster.constants';
import { PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS } from '../constants';
import type {
  RunPortalLoginPrepPipelineOptions,
  RunPortalLoginPrepPipelineResult,
} from '../types';
import { clickPortalLoginVerifyControl } from './click-portal-login-verify-control.util';
import { fillPortalLoginEmail } from './fill-portal-login-email.util';
import { fillPortalLoginPassword } from './fill-portal-login-password.util';
import { isPortalLoginFormVisible } from './is-portal-login-form-visible.util';
import { isPortalNavigationContextDestroyedError } from './is-portal-navigation-context-destroyed-error.util';
import { runPortalCaptchaVerifiedLoop } from './run-portal-captcha-verified-loop.util';
import { settlePortalPageAfterLoginVerify } from './settle-portal-page-after-login-verify.util';
import { verifyPortalLoginAuthenticated } from './verify-portal-login-authenticated.util';
import { waitForPortalLoginPasswordControl } from './wait-for-portal-login-password-control.util';

const logger = new Logger('runPortalLoginPrepPipeline');

/**
 * Login-page pipeline: decoy Email fill → optional captcha-service verify (DEC-010 / DEC-012).
 * Staff path (`submitPassword` unset/false): stop before password (DEC-006–008).
 * Workflow path (`submitPassword: true`): password fill + submit + auth verify (REQ-011).
 */
export const runPortalLoginPrepPipeline = async (
  options: RunPortalLoginPrepPipelineOptions,
): Promise<RunPortalLoginPrepPipelineResult> => {
  const logPrefix = options.logPrefix ?? 'portal-login-prep';
  const submitPassword = options.submitPassword === true;
  const notes: string[] = [];
  let emailFilled = false;
  let verifyClicked = false;
  let captchaAttempted = false;
  let captchaOk = false;
  let passwordFilled = false;
  let passwordSubmitted = false;
  let passwordSubmitAmbiguous = false;
  let loginAuthenticatedVerified = false;
  let screenshotPath: string | undefined;

  const baseFields = () => ({
    emailFilled,
    verifyClicked,
    captchaAttempted,
    captchaOk,
    passwordFilled: passwordFilled || undefined,
    passwordSubmitted: passwordSubmitted || undefined,
    passwordSubmitAmbiguous: passwordSubmitAmbiguous || undefined,
    loginAuthenticatedVerified: loginAuthenticatedVerified || undefined,
    screenshotPath,
    notes,
  });

  const emailFill = await fillPortalLoginEmail(
    options.page,
    options.portalFormEmail,
  );
  if (!emailFill.ok) {
    const error = emailFill.reason ?? 'login Email fill failed';
    logger.error(`${logPrefix} phase=login_email_fill failure ${error}`);
    notes.push(`Email fill failed: ${error}`);
    return {
      ok: false,
      error,
      emailFilled: false,
      verifyClicked: false,
      captchaAttempted: false,
      captchaOk: false,
      notes,
    };
  }
  emailFilled = true;
  notes.push('Email filled among decoys (value masked)');
  logger.log(`${logPrefix} phase=login_email_fill success`);

  const captchaServiceApiKey = options.captchaServiceApiKey?.trim() ?? '';
  const captchaEnabled = captchaServiceApiKey.length > 0;

  /**
   * Staff login-prep path (unchanged): optional captcha-service Verify, then stop.
   */
  if (!submitPassword) {
    if (captchaEnabled) {
      captchaAttempted = true;
      logger.log(`${logPrefix} phase=login_verify start`);
      try {
        await clickPortalLoginVerifyControl(options.page);
        verifyClicked = true;
        notes.push('#btnVerify clicked (captcha service path)');
        logger.log(`${logPrefix} phase=login_verify success`);
      } catch (err) {
        const error =
          err instanceof Error ? err.message : 'login Verify click failed';
        logger.error(`${logPrefix} phase=login_verify failure ${error}`);
        notes.push(`Verify click failed: ${error}`);
        return {
          ok: false,
          error,
          emailFilled,
          verifyClicked: false,
          captchaAttempted,
          captchaOk: false,
          notes,
        };
      }

      const captchaProvider = options.captchaProvider;
      if (!captchaProvider) {
        const error = 'captcha service was not injected';
        notes.push(error);
        return {
          ok: false,
          error,
          emailFilled,
          verifyClicked,
          captchaAttempted,
          captchaOk: false,
          notes,
        };
      }

      const budgetDeadlineAt = new Date(
        Date.now() + PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS,
      );
      logger.log(`${logPrefix} phase=captcha_verified_loop start`);
      const loopResult = await runPortalCaptchaVerifiedLoop(options.page, {
        captchaServiceApiKey: captchaServiceApiKey,
        timeoutMs: PORTAL_CAPMONSTER_TIMEOUT_MS,
        pollIntervalMs: PORTAL_CAPMONSTER_POLL_INTERVAL_MS,
        captchaProvider,
        budgetDeadlineAt,
        abortSignal: options.abortSignal,
        acceptLoginAuthSuccess: true,
      });

      if (!loopResult.ok) {
        const error = `captcha Verified loop failed (${loopResult.stopReason}): ${
          loopResult.error ?? 'unknown error'
        }`;
        logger.error(
          `${logPrefix} phase=captcha_verified_loop failure attempts=${loopResult.attempts} ${error}`,
        );
        notes.push(error);
        return {
          ok: false,
          error,
          ...(loopResult.errorCode
            ? { errorCode: loopResult.errorCode }
            : {}),
          emailFilled,
          verifyClicked,
          captchaAttempted,
          captchaOk: false,
          notes,
        };
      }

      captchaOk = true;
      notes.push(
        `captcha service verified (attempts=${loopResult.attempts}); stop before password/OTP/status (DEC-006–008)`,
      );
      logger.log(
        `${logPrefix} phase=captcha_verified_loop success attempts=${loopResult.attempts}`,
      );
    } else {
      notes.push(
        'fill-only: #btnVerify not clicked (captcha service key empty; DEC-012)',
      );
      notes.push('stop before password/OTP/status (DEC-006–008)');
      logger.log(
        `${logPrefix} phase=login_verify skipped reason=captcha_service_disabled`,
      );
    }

    if (options.screenshotPath) {
      try {
        await options.page.screenshot({
          path: options.screenshotPath,
          fullPage: true,
        });
        screenshotPath = options.screenshotPath;
        notes.push('screenshot captured (evidence only; no status claim)');
        logger.log(`${logPrefix} phase=screenshot success`);
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        notes.push(`screenshot failed: ${detail}`);
        logger.warn(`${logPrefix} phase=screenshot failure ${detail}`);
      }
    }

    return {
      ok: true,
      ...baseFields(),
    };
  }

  // --- Workflow password path (REQ-011 / TASK-009) ---
  const portalPassword = options.portalPassword ?? '';
  if (!portalPassword) {
    const error = 'portal password missing for login submit';
    logger.error(`${logPrefix} phase=login_password_fill failure ${error}`);
    notes.push(error);
    return { ok: false, error, ...baseFields() };
  }

  // VERIFY_THEN_REPEAT retry: already left login UI → COMPLETED without re-submit.
  const alreadyAuthed = await verifyPortalLoginAuthenticated(options.page, {
    waitMs: 2_000,
  });
  if (alreadyAuthed.ok) {
    loginAuthenticatedVerified = true;
    notes.push('already authenticated (login form absent)');
    logger.log(
      `${logPrefix} phase=login_auth already_verified via=${alreadyAuthed.via}`,
    );
    return { ok: true, ...baseFields() };
  }

  // Advance past email step (login.html → password / captcha page).
  let emailStepVerifyClicked = false;
  try {
    await clickPortalLoginVerifyControl(options.page);
    verifyClicked = true;
    emailStepVerifyClicked = true;
    notes.push('#btnVerify clicked (email_step_workflow)');
    logger.log(`${logPrefix} phase=login_verify success label=email_step`);
  } catch (err) {
    // May already be on password page from a prior attempt.
    const passwordProbe = await waitForPortalLoginPasswordControl(options.page, {
      waitMs: 5_000,
    });
    if (!passwordProbe.ok) {
      const error =
        err instanceof Error ? err.message : 'login Verify click failed';
      logger.error(`${logPrefix} phase=login_verify failure ${error}`);
      notes.push(`Verify click failed: ${error}`);
      return { ok: false, error, ...baseFields() };
    }
    notes.push('email verify click skipped; password controls already present');
  }

  // Settle only when email_step Verify ran this attempt (DEC-001 / TASK-005).
  if (emailStepVerifyClicked) {
    const settle = await settlePortalPageAfterLoginVerify(options.page);
    notes.push(
      `post-verify settle settled=${settle.settled} via=${settle.via}`,
    );
    logger.log(
      `${logPrefix} phase=login_post_verify_settle settled=${settle.settled} via=${settle.via}`,
    );
  }

  // Password wait + email_gate soft path; REQ-007 residual catch (DEC-005).
  try {
    const passwordReady = await waitForPortalLoginPasswordControl(options.page);
    if (!passwordReady.ok) {
      logger.warn(
        `${logPrefix} phase=login_password_wait failure reason=${passwordReady.reason ?? 'unknown'}`,
      );
      notes.push(
        `Password wait (pre-gate): ${passwordReady.reason ?? 'not ready'}`,
      );
      // Email-step captcha may be blocking navigation — solve if armed.
      if (captchaEnabled && options.captchaProvider) {
        captchaAttempted = true;
        const budgetDeadlineAt = new Date(
          Date.now() + PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS,
        );
        logger.log(
          `${logPrefix} phase=captcha_verified_loop start label=email_gate`,
        );
        const loopResult = await runPortalCaptchaVerifiedLoop(options.page, {
          captchaServiceApiKey: captchaServiceApiKey,
          timeoutMs: PORTAL_CAPMONSTER_TIMEOUT_MS,
          pollIntervalMs: PORTAL_CAPMONSTER_POLL_INTERVAL_MS,
          captchaProvider: options.captchaProvider,
          budgetDeadlineAt,
          abortSignal: options.abortSignal,
          acceptLoginAuthSuccess: true,
        });
        if (loopResult.ok) {
          captchaOk = true;
          notes.push(
            `captcha service verified email gate (attempts=${loopResult.attempts})`,
          );
        } else {
          const captchaError = `captcha service email gate failed (${loopResult.stopReason}): ${
            loopResult.error ?? 'unknown'
          }`;
          notes.push(captchaError);
          // Exhaustion / abort hard-fail the captcha phase (DEC-008 / DEC-012).
          if (loopResult.errorCode || loopResult.stopReason === 'aborted') {
            logger.error(
              `${logPrefix} phase=captcha_verified_loop failure ${captchaError}`,
            );
            return {
              ok: false,
              error: captchaError,
              ...(loopResult.errorCode
                ? { errorCode: loopResult.errorCode }
                : {}),
              ...baseFields(),
            };
          }
        }
      }

      const retryPassword = await waitForPortalLoginPasswordControl(options.page);
      if (!retryPassword.ok) {
        const error = retryPassword.reason ?? 'password control not ready';
        logger.error(`${logPrefix} phase=login_password_wait failure ${error}`);
        notes.push(`Password wait failed: ${error}`);
        return { ok: false, error, ...baseFields() };
      }
      logger.log(
        `${logPrefix} phase=login_password_wait success after_email_gate`,
      );
      notes.push('Password control ready after email_gate');
    } else {
      logger.log(`${logPrefix} phase=login_password_wait success`);
      notes.push('Password control ready after email_step');
    }
  } catch (err) {
    if (isPortalNavigationContextDestroyedError(err)) {
      const error =
        err instanceof Error
          ? err.message
          : 'navigation context destroyed during password wait';
      logger.error(
        `${logPrefix} phase=login_password_wait hard_failure ${error}`,
      );
      notes.push(`Password wait residual navigation race: ${error}`);
      return { ok: false, error, ...baseFields() };
    }
    throw err;
  }

  const passwordFill = await fillPortalLoginPassword(
    options.page,
    portalPassword,
  );
  if (!passwordFill.ok) {
    const error = passwordFill.reason ?? 'login Password fill failed';
    logger.error(`${logPrefix} phase=login_password_fill failure ${error}`);
    notes.push(`Password fill failed: ${error}`);
    return { ok: false, error, ...baseFields() };
  }
  passwordFilled = true;
  notes.push('Password filled among decoys (value masked)');
  logger.log(`${logPrefix} phase=login_password_fill success`);

  // Password + captcha page (login_captcha.html): captcha service then Submit.
  if (captchaEnabled) {
    const captchaProvider = options.captchaProvider;
    if (!captchaProvider) {
      const error = 'captcha service was not injected';
      notes.push(error);
      return { ok: false, error, ...baseFields() };
    }
    captchaAttempted = true;
    const budgetDeadlineAt = new Date(
      Date.now() + PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS,
    );
    logger.log(
      `${logPrefix} phase=captcha_verified_loop start label=password_step`,
    );
    const loopResult = await runPortalCaptchaVerifiedLoop(options.page, {
      captchaServiceApiKey: captchaServiceApiKey,
      timeoutMs: PORTAL_CAPMONSTER_TIMEOUT_MS,
      pollIntervalMs: PORTAL_CAPMONSTER_POLL_INTERVAL_MS,
      captchaProvider,
      budgetDeadlineAt,
      abortSignal: options.abortSignal,
      acceptLoginAuthSuccess: true,
    });
    if (loopResult.ok) {
      captchaOk = true;
      notes.push(
        `captcha service verified password step (attempts=${loopResult.attempts})`,
      );
      logger.log(
        `${logPrefix} phase=captcha_verified_loop success attempts=${loopResult.attempts} label=password_step`,
      );
    } else {
      // Abort during captcha is not an ambiguous submit (DEC-012).
      if (loopResult.stopReason === 'aborted') {
        const error = `captcha Verified loop failed (${loopResult.stopReason}): ${
          loopResult.error ?? 'unknown error'
        }`;
        logger.error(
          `${logPrefix} phase=captcha_verified_loop failure ${error}`,
        );
        notes.push(error);
        return { ok: false, error, ...baseFields() };
      }
      // Captcha submit may have navigated away without #btnVerified.
      const afterLoop = await verifyPortalLoginAuthenticated(options.page, {
        waitMs: 5_000,
      });
      if (afterLoop.ok) {
        loginAuthenticatedVerified = true;
        passwordSubmitted = true;
        notes.push('authenticated after password captcha path');
        return { ok: true, ...baseFields() };
      }
      const error = `captcha Verified loop failed (${loopResult.stopReason}): ${
        loopResult.error ?? 'unknown error'
      }`;
      logger.error(
        `${logPrefix} phase=captcha_verified_loop failure ${error}`,
      );
      notes.push(error);
      // Structured captcha exhaustion is not an ambiguous submit (DEC-005/008).
      if (loopResult.errorCode) {
        return {
          ok: false,
          error,
          errorCode: loopResult.errorCode,
          ...baseFields(),
        };
      }
      passwordSubmitAmbiguous = true;
      return { ok: false, error, ...baseFields() };
    }
  }

  // Conditional password_submit (REQ-013 / DEC-007): captcha confirm may already
  // have posted `#captchaForm` via `#btnVerify`/`onSubmit` — click only if form
  // remains actionable; form-gone ⇒ implicit submit success.
  if (await isPortalLoginFormVisible(options.page)) {
    try {
      await clickPortalLoginVerifyControl(options.page);
      verifyClicked = true;
      passwordSubmitted = true;
      notes.push('#btnVerify clicked (password_submit)');
      logger.log(`${logPrefix} phase=login_password_submit clicked`);
    } catch (err) {
      const afterMiss = await verifyPortalLoginAuthenticated(options.page, {
        waitMs: 5_000,
      });
      if (afterMiss.ok) {
        loginAuthenticatedVerified = true;
        passwordSubmitted = true;
        const navDestroyed = isPortalNavigationContextDestroyedError(err);
        notes.push(
          navDestroyed
            ? 'authenticated despite password_submit navigation context destroyed'
            : 'authenticated despite submit click miss',
        );
        logger.log(
          `${logPrefix} phase=login_password_submit soft_success via=${afterMiss.via}${navDestroyed ? ' nav_context_destroyed=true' : ''}`,
        );
        return { ok: true, ...baseFields() };
      }
      passwordSubmitAmbiguous = true;
      const error =
        err instanceof Error ? err.message : 'login password submit failed';
      notes.push(`Password submit click failed: ${error}`);
      return { ok: false, error, ...baseFields() };
    }
  } else {
    passwordSubmitted = true;
    loginAuthenticatedVerified = true;
    notes.push('login form cleared after captcha (submit implicit)');
    logger.log(
      `${logPrefix} phase=login_password_submit skipped reason=form_gone_implicit`,
    );
    return { ok: true, ...baseFields() };
  }

  const verified = await verifyPortalLoginAuthenticated(options.page);
  if (!verified.ok) {
    passwordSubmitAmbiguous = true;
    const error =
      verified.reason ?? 'authenticated landing not confirmed after password';
    logger.error(`${logPrefix} phase=login_auth failure ${error}`);
    notes.push(error);
    return { ok: false, error, ...baseFields() };
  }

  loginAuthenticatedVerified = true;
  notes.push(`authenticated landing verified via=${verified.via}`);
  logger.log(
    `${logPrefix} phase=login_auth success via=${verified.via ?? 'unknown'}`,
  );

  if (options.screenshotPath) {
    try {
      await options.page.screenshot({
        path: options.screenshotPath,
        fullPage: true,
      });
      screenshotPath = options.screenshotPath;
      notes.push('screenshot captured (post-auth evidence)');
      logger.log(`${logPrefix} phase=screenshot success`);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      notes.push(`screenshot failed: ${detail}`);
      logger.warn(`${logPrefix} phase=screenshot failure ${detail}`);
    }
  }

  return {
    ok: true,
    ...baseFields(),
  };
};
