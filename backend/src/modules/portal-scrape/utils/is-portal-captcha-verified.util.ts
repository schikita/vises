/// <reference lib="dom" />
import {
  PORTAL_CAPTCHA_VERIFIED_TEXT,
  PORTAL_REGISTER_USER_SELECTORS,
} from '../constants';
import type { PortalPage } from '../types';

/**
 * Parent-page Verified success predicate (REQ-001 / DEC-006).
 * Hidden / display:none `#btnVerified` (fixture) must return false.
 */
export const isPortalCaptchaVerified = async (
  page: PortalPage,
): Promise<boolean> => {
  const selector = PORTAL_REGISTER_USER_SELECTORS.verifiedControl;
  const verifiedText = PORTAL_CAPTCHA_VERIFIED_TEXT;

  return page.evaluate(
    ({ sel, text }: { sel: string; text: string }) => {
      const el = document.querySelector(sel);
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
      if (rect.width < 1 || rect.height < 1) {
        return false;
      }

      const label = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
      return label.includes(text);
    },
    { sel: selector, text: verifiedText },
  );
};
