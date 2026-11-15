/// <reference lib="dom" />
import { PORTAL_BOOKING_SELECTORS } from '../constants';
import type { PortalPage } from '../types';
import { isPortalNavigationContextDestroyedError } from './is-portal-navigation-context-destroyed-error.util';

type SlotsBannerArg = {
  bannerText: string;
  containerId: string;
};

/**
 * True when exact banner text `Appointment slots are not available` is
 * visibly present (`slots-not-available.html` / REQ-014 / VT-TASK-009).
 * Prefers `#div-main` body text; falls back to visible `.alert-danger`.
 */
export const isPortalBookingSlotsUnavailableVisible = async (
  page: PortalPage,
): Promise<boolean> => {
  const arg: SlotsBannerArg = {
    bannerText: PORTAL_BOOKING_SELECTORS.slotsUnavailableBannerText,
    containerId: PORTAL_BOOKING_SELECTORS.slotsUnavailableContainerId,
  };

  try {
    return await page.evaluate((a: SlotsBannerArg) => {
      const collapse = (text: string): string =>
        text.replace(/\s+/g, ' ').trim().toLowerCase();
      const needle = collapse(a.bannerText);

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

      const textMatchesExact = (raw: string): boolean =>
        collapse(raw) === needle;

      const container = document.getElementById(a.containerId);
      if (container && isVisiblyPresent(container)) {
        const alerts = Array.from(
          container.querySelectorAll('.alert-danger, .alert.alert-danger'),
        );
        for (const el of alerts) {
          if (!isVisiblyPresent(el)) continue;
          if (textMatchesExact(el.textContent ?? '')) {
            return true;
          }
        }
        // Prefer exact phrase in container text (alert + Try Again siblings).
        if (collapse(container.textContent ?? '').includes(needle)) {
          return true;
        }
      }

      const alerts = Array.from(
        document.querySelectorAll('.alert-danger, .alert.alert-danger'),
      );
      for (const el of alerts) {
        if (!isVisiblyPresent(el)) continue;
        if (textMatchesExact(el.textContent ?? '')) {
          return true;
        }
      }

      const body = collapse(document.body?.textContent ?? '');
      return body.includes(needle);
    }, arg);
  } catch (err) {
    if (isPortalNavigationContextDestroyedError(err)) {
      return false;
    }
    throw err;
  }
};
