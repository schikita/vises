/// <reference lib="dom" />
import { PORTAL_BOOKING_SELECTORS } from '../constants';
import type { PortalPage } from '../types';
import { isPortalNavigationContextDestroyedError } from './is-portal-navigation-context-destroyed-error.util';

type CaptchaSurfaceArg = {
  captchaMainDivId: string;
  captchaDivClass: string;
  captchaChallengeRootClass: string;
  captchaVerifyButtonId: string;
};

/**
 * True when booking captcha roots are visible and `#btnVerify` path is
 * present (`book-appoinntment-captcha.html` / REQ-013 / VT-TASK-008).
 * Roots: `#captcha-main-div` ∨ `.captcha-div` ∨ `.main-div-container`.
 */
export const isPortalBookingCaptchaSurfaceVisible = async (
  page: PortalPage,
): Promise<boolean> => {
  const arg: CaptchaSurfaceArg = {
    captchaMainDivId: PORTAL_BOOKING_SELECTORS.captchaMainDivId,
    captchaDivClass: PORTAL_BOOKING_SELECTORS.captchaDivClass,
    captchaChallengeRootClass:
      PORTAL_BOOKING_SELECTORS.captchaChallengeRootClass,
    captchaVerifyButtonId: PORTAL_BOOKING_SELECTORS.captchaVerifyButtonId,
  };

  try {
    return await page.evaluate((a: CaptchaSurfaceArg) => {
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

      const rootVisible =
        isVisiblyPresent(document.getElementById(a.captchaMainDivId)) ||
        isVisiblyPresent(
          document.querySelector(`.${a.captchaDivClass}`),
        ) ||
        isVisiblyPresent(
          document.querySelector(`.${a.captchaChallengeRootClass}`),
        );

      if (!rootVisible) {
        return false;
      }

      return isVisiblyPresent(
        document.getElementById(a.captchaVerifyButtonId),
      );
    }, arg);
  } catch (err) {
    if (isPortalNavigationContextDestroyedError(err)) {
      return false;
    }
    throw err;
  }
};
