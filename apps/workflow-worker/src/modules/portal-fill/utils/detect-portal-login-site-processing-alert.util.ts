/// <reference lib="dom" />
import {
  PORTAL_LOGIN_SITE_ERROR_ALERT_SELECTOR,
  PORTAL_LOGIN_SITE_PROCESSING_MESSAGE_CUES,
} from '../constants';
import type {
  PortalLoginSiteProcessingAlertProbeResult,
  PortalPage,
} from '../types';
import { isPortalNavigationContextDestroyedError } from './is-portal-navigation-context-destroyed-error.util';

type DetectArg = {
  alertSelector: string;
  cues: readonly string[];
};

/**
 * Probe for portal site-processing `.alert.alert-danger` (DEC-003 / DEC-005).
 * Matches DEC-003 cues after trim + whitespace collapse + lower-case.
 * Nav-destroyed evaluate → `{ present: false }` (do not invent auth success;
 * form AfterNav remains conservative).
 */
export const detectPortalLoginSiteProcessingAlert = async (
  page: PortalPage,
): Promise<PortalLoginSiteProcessingAlertProbeResult> => {
  const arg: DetectArg = {
    alertSelector: PORTAL_LOGIN_SITE_ERROR_ALERT_SELECTOR,
    cues: PORTAL_LOGIN_SITE_PROCESSING_MESSAGE_CUES,
  };

  try {
    return await page.evaluate((a: DetectArg) => {
      const normalize = (text: string): string =>
        text.replace(/\s+/g, ' ').trim().toLowerCase();

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

      const cues = a.cues.map((c) => normalize(c));
      const alerts = Array.from(document.querySelectorAll(a.alertSelector));

      for (const el of alerts) {
        if (!isVisiblyPresent(el)) continue;
        const alertText = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
        if (!alertText) continue;
        const normalized = normalize(alertText);
        const matched = cues.some((cue) => normalized.includes(cue));
        if (matched) {
          return { present: true, alertText };
        }
      }

      return { present: false };
    }, arg);
  } catch (err) {
    if (isPortalNavigationContextDestroyedError(err)) {
      return { present: false };
    }
    throw err;
  }
};
