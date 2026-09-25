import { Logger } from '@nestjs/common';
import { PORTAL_CAPTCHA_CHALLENGE_READY_PROBE_MS } from '../constants';
import type { PortalPage } from '../types';
import { clickPortalCaptchaVerifyControl } from './click-portal-captcha-verify-control.util';
import { isPortalCaptchaChallengeAbsentError } from './is-portal-captcha-challenge-absent-error.util';
import { resolveCaptchaFrame } from './portal-captcha-frame.util';

const logger = new Logger('PortalCaptchaVerifiedLoop');

/**
 * Ensure GenerateCaptcha iframe/challenge is ready (DEC-002).
 * Probe without Verify; on absent → click `#btnVerify` once → retry resolve.
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
    await resolveCaptchaFrame(page, { waitTimeoutMs: probeMs });
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
  await resolveCaptchaFrame(page, { waitTimeoutMs: retryMs });
};
