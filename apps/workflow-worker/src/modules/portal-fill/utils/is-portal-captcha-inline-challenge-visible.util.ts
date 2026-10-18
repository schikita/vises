/// <reference lib="dom" />
import {
  PORTAL_CAPTCHA_INLINE_CHALLENGE_ROOT,
  PORTAL_CAPTCHA_INLINE_ROOT,
} from '../constants';
import type { PortalPage } from '../types';

type InlineProbeArg = {
  rootSel: string;
  challengeRootSel: string;
};

/**
 * Cheap main-document probe for an inline BLS captcha challenge
 * (portal-login-inline-captcha DEC-002 step 1 / REQ-001).
 * True when `#captcha-main-div` and/or `.main-div-container` is visibly present.
 * Does not wait, click, or require an iframe.
 */
export const isPortalCaptchaInlineChallengeVisible = async (
  page: PortalPage,
): Promise<boolean> => {
  const arg: InlineProbeArg = {
    rootSel: PORTAL_CAPTCHA_INLINE_ROOT,
    challengeRootSel: PORTAL_CAPTCHA_INLINE_CHALLENGE_ROOT,
  };

  return page.evaluate((a: InlineProbeArg) => {
    const isVisiblyPresent = (el: Element | null): boolean => {
      if (!el) return false;

      let node: Element | null = el;
      while (node) {
        const style = window.getComputedStyle(node);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          style.opacity === '0'
        ) {
          return false;
        }
        node = node.parentElement;
      }

      const rect = el.getBoundingClientRect();
      return rect.width >= 1 && rect.height >= 1;
    };

    return (
      isVisiblyPresent(document.querySelector(a.rootSel)) ||
      isVisiblyPresent(document.querySelector(a.challengeRootSel))
    );
  }, arg);
};
