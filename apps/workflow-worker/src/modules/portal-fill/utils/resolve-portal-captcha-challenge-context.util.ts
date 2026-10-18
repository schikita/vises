/**
 * Dual-surface captcha challenge resolve (portal-login-inline-captcha DEC-001 / DEC-002).
 * Probe order: cheap inline visibility → short iframe slice → both prefer iframe;
 * remaining budget interleaves dual detection (never iframe-only hang ignoring inline).
 */
import {
  PORTAL_CAPTCHA_DUAL_SURFACE_ABSENT_ERROR,
  PORTAL_CAPTCHA_SELECTORS,
  PORTAL_CAPTCHA_SURFACE_QUICK_PROBE_MS,
  type PortalCaptchaSelectorSet,
} from '../constants';
import type {
  PortalCaptchaChallengeContext,
  PortalFrame,
  PortalPage,
} from '../types';
import { buildPortalCaptchaSurfaceSelectors } from './build-portal-captcha-surface-selectors.util';
import { isPortalCaptchaChallengeAbsentError } from './is-portal-captcha-challenge-absent-error.util';
import { isPortalCaptchaInlineChallengeVisible } from './is-portal-captcha-inline-challenge-visible.util';
import { resolveCaptchaFrame } from './portal-captcha-frame.util';

const INTERLEAVE_PAUSE_MS = 250;
/** Brief iframe check when inline is already visible (both → prefer iframe). */
const INLINE_PRESENT_IFRAME_SLICE_MS = 500;

export const resolvePortalCaptchaChallengeContext = async (
  page: PortalPage,
  options?: {
    selectors?: PortalCaptchaSelectorSet;
    waitTimeoutMs?: number;
  },
): Promise<PortalCaptchaChallengeContext> => {
  const baseSelectors = options?.selectors ?? PORTAL_CAPTCHA_SELECTORS;
  const waitTimeoutMs =
    options?.waitTimeoutMs ?? PORTAL_CAPTCHA_SURFACE_QUICK_PROBE_MS;
  const deadline = Date.now() + Math.max(0, waitTimeoutMs);

  while (true) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      break;
    }

    const inlineVisible = await isPortalCaptchaInlineChallengeVisible(page);

    let iframe: PortalFrame | null = null;
    const iframeBudgetMs = inlineVisible
      ? Math.min(INLINE_PRESENT_IFRAME_SLICE_MS, remaining)
      : Math.min(PORTAL_CAPTCHA_SURFACE_QUICK_PROBE_MS, remaining);

    if (iframeBudgetMs > 0) {
      try {
        iframe = await resolveCaptchaFrame(page, {
          selectors: baseSelectors,
          waitTimeoutMs: iframeBudgetMs,
        });
      } catch (err) {
        if (!isPortalCaptchaChallengeAbsentError(err)) {
          throw err;
        }
      }
    }

    if (iframe) {
      return {
        kind: 'iframe',
        context: iframe,
        selectors: buildPortalCaptchaSurfaceSelectors('iframe', baseSelectors),
      };
    }

    if (inlineVisible) {
      return {
        kind: 'inline',
        context: page,
        selectors: buildPortalCaptchaSurfaceSelectors('inline', baseSelectors),
      };
    }

    const pauseMs = Math.min(INTERLEAVE_PAUSE_MS, deadline - Date.now());
    if (pauseMs <= 0) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, pauseMs));
  }

  throw new Error(
    `${PORTAL_CAPTCHA_DUAL_SURFACE_ABSENT_ERROR} (inline main-frame or GenerateCaptcha iframe) within ${waitTimeoutMs}ms`,
  );
};
