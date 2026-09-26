import { Logger } from '@nestjs/common';
import { PORTAL_CAPTCHA_CHALLENGE_READY_PROBE_MS } from '../constants';
import type { PortalPage } from '../types';
import { clickPortalCaptchaVerifyControl } from './click-portal-captcha-verify-control.util';
import { isPortalCaptchaChallengeAbsentError } from './is-portal-captcha-challenge-absent-error.util';
import { resolvePortalCaptchaChallengeContext } from './resolve-portal-captcha-challenge-context.util';

const logger = new Logger('PortalCaptchaVerifiedLoop');

/**
 * Ensure captcha challenge ready on either surface (DEC-001 / DEC-002).
 * Dual-surface probe first; adaptive `#btnVerify` only when neither surface
 * is ready (REQ-006 / DEC-003). Never adaptive-click when inline is already
 * visible (would submit `#captchaForm` before cell selection).
 */
export const ensurePortalCaptchaChallengeReady = async (
  page: PortalPage,
  options: { waitTimeoutMs: number; logPrefix: string },
): Promise<void> => {
  const probeMs = Math.min(
    PORTAL_CAPTCHA_CHALLENGE_READY_PROBE_MS,
    options.waitTimeoutMs,
  );

  try {
    const ctx = await resolvePortalCaptchaChallengeContext(page, {
      waitTimeoutMs: probeMs,
    });
    if (ctx.kind === 'inline') {
      logger.log(
        `${options.logPrefix} phase=captcha_ensure ready surface=inline reason=inline_present skip_adaptive_verify`,
      );
    } else {
      logger.log(
        `${options.logPrefix} phase=captcha_ensure ready surface=iframe`,
      );
    }
    return;
  } catch (err) {
    if (!isPortalCaptchaChallengeAbsentError(err)) {
      throw err;
    }
    logger.log(
      `${options.logPrefix} phase=captcha_adaptive_verify reason=challenge_absent`,
    );
  }

  await clickPortalCaptchaVerifyControl(page);
  logger.log(
    `${options.logPrefix} phase=captcha_adaptive_verify success clicked=true`,
  );

  const retryMs = Math.max(probeMs, options.waitTimeoutMs);
  const after = await resolvePortalCaptchaChallengeContext(page, {
    waitTimeoutMs: retryMs,
  });
  logger.log(
    `${options.logPrefix} phase=captcha_ensure ready surface=${after.kind} after_adaptive_verify`,
  );
};
