/**
 * Resolve the GenerateCaptcha iframe after #btnVerify (sample-backed DEC-009).
 */
import {
  PORTAL_CAPTCHA_IFRAME_URL_PATTERN,
  PORTAL_CAPTCHA_SELECTORS,
  type PortalCaptchaSelectorSet,
} from '../constants';
import type { PortalFrame, PortalPage } from '../types';

const FRAME_POLL_MS = 250;

/**
 * Wait for the CAPTCHA iframe on the parent page, then return the child frame
 * whose URL matches GenerateCaptcha / CaptchaPublic.
 */
export const resolveCaptchaFrame = async (
  page: PortalPage,
  options?: {
    selectors?: PortalCaptchaSelectorSet;
    waitTimeoutMs?: number;
  },
): Promise<PortalFrame> => {
  const selectors = options?.selectors ?? PORTAL_CAPTCHA_SELECTORS;
  const waitTimeoutMs = options?.waitTimeoutMs ?? 30_000;

  try {
    await page.waitForSelector(selectors.iframe, {
      state: 'attached',
      timeout: waitTimeoutMs,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `CAPTCHA iframe not attached within ${waitTimeoutMs}ms (${selectors.iframe}): ${msg}`,
    );
  }

  const deadline = Date.now() + waitTimeoutMs;
  let lastError = 'no matching frame yet';

  while (Date.now() < deadline) {
    const frames = page.frames();
    const match = frames.find((frame) =>
      PORTAL_CAPTCHA_IFRAME_URL_PATTERN.test(frame.url()),
    );
    if (match) {
      try {
        await match.waitForSelector(selectors.challengeRoot, {
          state: 'visible',
          timeout: Math.min(5_000, Math.max(500, deadline - Date.now())),
        });
        return match;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, FRAME_POLL_MS));
  }

  throw new Error(
    `CAPTCHA iframe frame/content not ready within ${waitTimeoutMs}ms: ${lastError}`,
  );
};
