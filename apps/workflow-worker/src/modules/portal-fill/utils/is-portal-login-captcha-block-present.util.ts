/// <reference lib="dom" />
import {
  PORTAL_LOGIN_SELECTORS,
  PORTAL_LOGIN_SITE_ERROR_CAPTCHA_DIV_SELECTOR,
  PORTAL_LOGIN_SITE_ERROR_CAPTCHA_MAIN_DIV_SELECTOR,
} from '../constants';
import type { PortalPage } from '../types';
import { isPortalNavigationContextDestroyedError } from './is-portal-navigation-context-destroyed-error.util';

type CaptchaBlockArg = {
  captchaDivSel: string;
  captchaMainDivSel: string;
  captchaFormActionSubstring: string;
};

/**
 * True when a login captcha block cue is present (DEC-003 REQ-002 item 2):
 * `.captcha-div` ∨ `#captcha-main-div` ∨ form action containing LoginCaptchaSubmit.
 */
export const isPortalLoginCaptchaBlockPresent = async (
  page: PortalPage,
): Promise<boolean> => {
  const arg: CaptchaBlockArg = {
    captchaDivSel: PORTAL_LOGIN_SITE_ERROR_CAPTCHA_DIV_SELECTOR,
    captchaMainDivSel: PORTAL_LOGIN_SITE_ERROR_CAPTCHA_MAIN_DIV_SELECTOR,
    captchaFormActionSubstring:
      PORTAL_LOGIN_SELECTORS.captchaFormActionSubstring,
  };

  try {
    return await page.evaluate((a: CaptchaBlockArg) => {
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

      if (isVisiblyPresent(document.querySelector(a.captchaDivSel))) {
        return true;
      }
      if (isVisiblyPresent(document.querySelector(a.captchaMainDivSel))) {
        return true;
      }
      const forms = Array.from(document.querySelectorAll('form'));
      return forms.some((f) =>
        (f.getAttribute('action') ?? '').includes(a.captchaFormActionSubstring),
      );
    }, arg);
  } catch (err) {
    if (isPortalNavigationContextDestroyedError(err)) {
      return false;
    }
    throw err;
  }
};
