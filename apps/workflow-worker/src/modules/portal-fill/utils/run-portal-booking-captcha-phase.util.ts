import { Logger } from '@nestjs/common';
import {
  PORTAL_CAPMONSTER_POLL_INTERVAL_MS,
  PORTAL_CAPMONSTER_TIMEOUT_MS,
} from '../../capmonster/constants/capmonster.constants';
import {
  PORTAL_BOOKING_CHECKPOINT_OUTCOME,
  PORTAL_BOOKING_CHECKPOINT_STEP,
  PORTAL_BOOKING_CHECKPOINT_STUCK_CODE,
  PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS,
} from '../constants';
import type {
  RunPortalBookingCaptchaPhaseOptions,
  RunPortalBookingCaptchaPhaseResult,
} from '../types/portal-booking-captcha.types';
import { probePortalBookingCaptchaSurface } from './probe-portal-booking-captcha-surface.util';
import { runPortalCaptchaVerifiedLoop } from './run-portal-captcha-verified-loop.util';

const logger = new Logger('runPortalBookingCaptchaPhase');

/**
 * After VisaType Submit: always probe booking captcha; when present reuse
 * `solvePortalBlsCaptcha` / `clickPortalCaptchaVerifyControl` (via verified
 * loop ensure) / verified-loop solve machinery (REQ-013 / VT-TASK-008).
 * Success = booking captcha surface dismissed (materials: `#btnVerify` only;
 * does **not** require `#btnVerified`). Fail only when surface remains or
 * solve/verify truly fails. Never logs captcha answers or CapMonster keys.
 */
export const runPortalBookingCaptchaPhase = async (
  options: RunPortalBookingCaptchaPhaseOptions,
): Promise<RunPortalBookingCaptchaPhaseResult> => {
  const logPrefix = options.logPrefix ?? 'portal-booking-captcha';
  const notes: string[] = [];

  logger.log(`${logPrefix} phase=captcha_probe start`);
  const probe = await probePortalBookingCaptchaSurface(options.page);
  if (!probe.present) {
    notes.push('booking_captcha_absent');
    logger.log(`${logPrefix} phase=captcha_probe absent continuing`);
    return { ok: true, captchaPresent: false, notes };
  }

  notes.push('booking_captcha_present');
  logger.log(`${logPrefix} phase=captcha_probe present`);

  if (options.onCheckpoint) {
    await options.onCheckpoint({
      lastCompletedStep: PORTAL_BOOKING_CHECKPOINT_STEP.CAPTCHA_PENDING,
      lastOutcome: PORTAL_BOOKING_CHECKPOINT_OUTCOME.CAPTCHA_PENDING,
      stuckCode: PORTAL_BOOKING_CHECKPOINT_STUCK_CODE.BOOK_CAPTCHA_PENDING,
    });
  }

  const captchaServiceApiKey = options.captchaServiceApiKey?.trim() ?? '';
  if (captchaServiceApiKey.length === 0) {
    const error =
      'booking captcha present but captcha service key empty (REQ-013)';
    logger.error(`${logPrefix} phase=captcha_solve failure ${error}`);
    notes.push(error);
    return { ok: false, captchaPresent: true, captchaOk: false, error, notes };
  }

  const captchaProvider = options.captchaProvider;
  if (!captchaProvider) {
    const error = 'captcha service was not injected';
    logger.error(`${logPrefix} phase=captcha_solve failure ${error}`);
    notes.push(error);
    return { ok: false, captchaPresent: true, captchaOk: false, error, notes };
  }

  const budgetDeadlineAt = new Date(
    Date.now() + PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS,
  );
  logger.log(
    `${logPrefix} phase=captcha_verified_loop start successMode=booking_surface_dismiss`,
  );
  const loopResult = await runPortalCaptchaVerifiedLoop(options.page, {
    captchaServiceApiKey,
    timeoutMs: PORTAL_CAPMONSTER_TIMEOUT_MS,
    pollIntervalMs: PORTAL_CAPMONSTER_POLL_INTERVAL_MS,
    captchaProvider,
    budgetDeadlineAt,
    abortSignal: options.abortSignal,
    acceptBookingSurfaceDismiss: true,
  });

  if (!loopResult.ok) {
    const error = `booking captcha solve failed (${loopResult.stopReason}): ${
      loopResult.error ?? 'unknown error'
    }`;
    logger.error(
      `${logPrefix} phase=captcha_verified_loop failure attempts=${loopResult.attempts} ${error}`,
    );
    notes.push(error);
    return {
      ok: false,
      captchaPresent: true,
      captchaOk: false,
      error,
      ...(loopResult.errorCode ? { errorCode: loopResult.errorCode } : {}),
      notes,
    };
  }

  notes.push(
    `booking_captcha_ok attempts=${loopResult.attempts} stop=${loopResult.stopReason} via=booking_surface_dismiss`,
  );
  logger.log(
    `${logPrefix} phase=captcha_verified_loop success attempts=${loopResult.attempts} via=booking_surface_dismiss`,
  );

  if (options.onCheckpoint) {
    await options.onCheckpoint({
      lastCompletedStep: PORTAL_BOOKING_CHECKPOINT_STEP.CAPTCHA_OK,
      lastOutcome: null,
      stuckCode: null,
    });
  }

  return {
    ok: true,
    captchaPresent: true,
    captchaOk: true,
    notes,
  };
};
