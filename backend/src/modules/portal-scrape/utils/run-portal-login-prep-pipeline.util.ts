import { Logger } from '@nestjs/common';
import {
  PORTAL_CAPMONSTER_POLL_INTERVAL_MS,
  PORTAL_CAPMONSTER_TIMEOUT_MS,
} from '../../capmonster';
import { PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS } from '../constants';
import type {
  RunPortalLoginPrepPipelineOptions,
  RunPortalLoginPrepPipelineResult,
} from '../types';
import { clickPortalLoginVerifyControl } from './click-portal-login-verify-control.util';
import { fillPortalLoginEmail } from './fill-portal-login-email.util';
import { fillPortalLoginPassword } from './fill-portal-login-password.util';
import { isPortalLoginFormVisible } from './is-portal-login-form-visible.util';
import { runPortalCaptchaVerifiedLoop } from './run-portal-captcha-verified-loop.util';
import { verifyPortalLoginAuthenticated } from './verify-portal-login-authenticated.util';
import { waitForPortalLoginPasswordControl } from './wait-for-portal-login-password-control.util';

const logger = new Logger('runPortalLoginPrepPipeline');

/**
 * Login-page pipeline: decoy Email fill → optional CapMonster verify (DEC-010 / DEC-012).
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
  let capMonsterAttempted = false;
  let capMonsterOk = false;
  let passwordFilled = false;
  let passwordSubmitted = false;
  let passwordSubmitAmbiguous = false;
  let loginAuthenticatedVerified = false;
  let screenshotPath: string | undefined;

  const baseFields = () => ({
    emailFilled,
    verifyClicked,
    capMonsterAttempted,
    capMonsterOk,
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
      capMonsterAttempted: false,
      capMonsterOk: false,
      notes,
    };
  }
  emailFilled = true;
  notes.push('Email filled among decoys (value masked)');
  logger.log(`${logPrefix} phase=login_email_fill success`);

  const capMonsterApiKey = options.capMonsterApiKey?.trim() ?? '';
  const capMonsterEnabled = capMonsterApiKey.length > 0;

  /**
   * Staff login-prep path (unchanged): optional CapMonster Verify, then stop.
   */
  if (!submitPassword) {
    if (capMonsterEnabled) {
      capMonsterAttempted = true;
      logger.log(`${logPrefix} phase=login_verify start`);
      try {
        await clickPortalLoginVerifyControl(options.page);
        verifyClicked = true;
        notes.push('#btnVerify clicked (CapMonster path)');
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
          capMonsterAttempted,
          capMonsterOk: false,
          notes,
        };
      }

      const capMonster = options.capMonster;
      if (!capMonster) {
        const error = 'CapMonster service was not injected';
        notes.push(error);
        return {
          ok: false,
          error,
          emailFilled,
          verifyClicked,
          capMonsterAttempted,
          capMonsterOk: false,
          notes,
        };
      }

      const budgetDeadlineAt = new Date(
        Date.now() + PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS,
      );
      logger.log(`${logPrefix} phase=capmonster_verified_loop start`);
      const loopResult = await runPortalCaptchaVerifiedLoop(options.page, {
        clientKey: capMonsterApiKey,
        timeoutMs: PORTAL_CAPMONSTER_TIMEOUT_MS,
        pollIntervalMs: PORTAL_CAPMONSTER_POLL_INTERVAL_MS,
        capMonster,
        budgetDeadlineAt,
      });

      if (!loopResult.ok) {
        const error = `CapMonster Verified loop failed (${loopResult.stopReason}): ${
          loopResult.error ?? 'unknown error'
        }`;
        logger.error(
          `${logPrefix} phase=capmonster_verified_loop failure attempts=${loopResult.attempts} ${error}`,
        );
        notes.push(error);
        return {
          ok: false,
          error,
          emailFilled,
          verifyClicked,
          capMonsterAttempted,
          capMonsterOk: false,
          notes,
        };
      }

      capMonsterOk = true;
      notes.push(
        `CapMonster verified (attempts=${loopResult.attempts}); stop before password/OTP/status (DEC-006–008)`,
      );
      logger.log(
        `${logPrefix} phase=capmonster_verified_loop success attempts=${loopResult.attempts}`,
      );
    } else {
      notes.push(
        'fill-only: #btnVerify not clicked (CapMonster key empty; DEC-012)',
      );
      notes.push('stop before password/OTP/status (DEC-006–008)');
      logger.log(
        `${logPrefix} phase=login_verify skipped reason=CapMonster_disabled`,
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
  try {
    await clickPortalLoginVerifyControl(options.page);
    verifyClicked = true;
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

  const passwordReady = await waitForPortalLoginPasswordControl(options.page);
  if (!passwordReady.ok) {
    // Email-step captcha may be blocking navigation — solve if armed.
    if (capMonsterEnabled && options.capMonster) {
      capMonsterAttempted = true;
      const budgetDeadlineAt = new Date(
        Date.now() + PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS,
      );
      logger.log(
        `${logPrefix} phase=capmonster_verified_loop start label=email_gate`,
      );
      const loopResult = await runPortalCaptchaVerifiedLoop(options.page, {
        clientKey: capMonsterApiKey,
        timeoutMs: PORTAL_CAPMONSTER_TIMEOUT_MS,
        pollIntervalMs: PORTAL_CAPMONSTER_POLL_INTERVAL_MS,
        capMonster: options.capMonster,
        budgetDeadlineAt,
      });
      if (loopResult.ok) {
        capMonsterOk = true;
        notes.push(
          `CapMonster verified email gate (attempts=${loopResult.attempts})`,
        );
      } else {
        notes.push(
          `CapMonster email gate failed (${loopResult.stopReason}): ${
            loopResult.error ?? 'unknown'
          }`,
        );
      }
    }

    const retryPassword = await waitForPortalLoginPasswordControl(options.page);
    if (!retryPassword.ok) {
      const error = retryPassword.reason ?? 'password control not ready';
      logger.error(`${logPrefix} phase=login_password_wait failure ${error}`);
      notes.push(`Password wait failed: ${error}`);
      return { ok: false, error, ...baseFields() };
    }
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

  // Password + captcha page (login_captcha.html): CapMonster then Submit.
  if (capMonsterEnabled) {
    const capMonster = options.capMonster;
    if (!capMonster) {
      const error = 'CapMonster service was not injected';
      notes.push(error);
      return { ok: false, error, ...baseFields() };
    }
    capMonsterAttempted = true;
    const budgetDeadlineAt = new Date(
      Date.now() + PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS,
    );
    logger.log(
      `${logPrefix} phase=capmonster_verified_loop start label=password_step`,
    );
    const loopResult = await runPortalCaptchaVerifiedLoop(options.page, {
      clientKey: capMonsterApiKey,
      timeoutMs: PORTAL_CAPMONSTER_TIMEOUT_MS,
      pollIntervalMs: PORTAL_CAPMONSTER_POLL_INTERVAL_MS,
      capMonster,
      budgetDeadlineAt,
    });
    if (loopResult.ok) {
      capMonsterOk = true;
      notes.push(
        `CapMonster verified password step (attempts=${loopResult.attempts})`,
      );
      logger.log(
        `${logPrefix} phase=capmonster_verified_loop success attempts=${loopResult.attempts} label=password_step`,
      );
    } else {
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
      const error = `CapMonster Verified loop failed (${loopResult.stopReason}): ${
        loopResult.error ?? 'unknown error'
      }`;
      logger.error(
        `${logPrefix} phase=capmonster_verified_loop failure ${error}`,
      );
      notes.push(error);
      passwordSubmitAmbiguous = true;
      return { ok: false, error, ...baseFields() };
    }
  }

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
        notes.push('authenticated despite submit click miss');
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
