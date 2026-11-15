import {
  PORTAL_OVERLAY_CLEAR_POLL_MS,
  PORTAL_OVERLAY_CLEAR_WAIT_MS,
  PORTAL_OVERLAY_GLOBAL_SELECTOR,
  PORTAL_OVERLAY_PRELOADER_SELECTOR,
} from '../constants';
import type { WaitForPortalOverlaysClearResult } from '../types';
import type { PortalDomContext } from '../types/portal-dom-context.types';
import { isPortalNavigationContextDestroyedError } from './is-portal-navigation-context-destroyed-error.util';

type OverlayProbeArg = {
  preloaderSelector: string;
  globalOverlaySelector: string;
};

const probeOverlaysBlocking = async (
  context: PortalDomContext,
): Promise<boolean> => {
  const arg: OverlayProbeArg = {
    preloaderSelector: PORTAL_OVERLAY_PRELOADER_SELECTOR,
    globalOverlaySelector: PORTAL_OVERLAY_GLOBAL_SELECTOR,
  };

  return context.evaluate((a: OverlayProbeArg) => {
    const isBlocking = (el: Element | null): boolean => {
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
      // fadeOut / pointer-events:none → not blocking interaction
      const own = window.getComputedStyle(el);
      if (own.pointerEvents === 'none') {
        return false;
      }
      return true;
    };

    const preloader = document.querySelector(a.preloaderSelector);
    if (isBlocking(preloader)) {
      return true;
    }
    const overlay = document.querySelector(a.globalOverlaySelector);
    if (isBlocking(overlay)) {
      return true;
    }
    return false;
  }, arg);
};

/**
 * Poll until `.preloader` / `#global-overlay` are not blocking (FR-5).
 * Does not click through overlays. Timeout → clear:false (map to ENTER_OVERLAY_STUCK).
 * Works on top document or Edit Member iframe context.
 */
export const waitForPortalOverlaysClear = async (
  context: PortalDomContext,
  options?: { waitMs?: number; pollMs?: number },
): Promise<WaitForPortalOverlaysClearResult> => {
  const waitMs = options?.waitMs ?? PORTAL_OVERLAY_CLEAR_WAIT_MS;
  const pollMs = options?.pollMs ?? PORTAL_OVERLAY_CLEAR_POLL_MS;
  const deadline = Date.now() + waitMs;

  try {
    const blocking = await probeOverlaysBlocking(context);
    if (!blocking) {
      return { clear: true, via: 'already_clear' };
    }

    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, pollMs));
      const stillBlocking = await probeOverlaysBlocking(context);
      if (!stillBlocking) {
        return { clear: true, via: 'cleared' };
      }
    }

    return {
      clear: false,
      via: 'timeout',
      reason: `portal overlays still blocking after ${waitMs}ms`,
    };
  } catch (err) {
    if (isPortalNavigationContextDestroyedError(err)) {
      return {
        clear: false,
        via: 'error',
        reason: 'navigation context destroyed during overlay wait',
      };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { clear: false, via: 'error', reason: message };
  }
};
