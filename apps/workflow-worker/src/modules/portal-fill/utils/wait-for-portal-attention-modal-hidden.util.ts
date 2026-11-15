import {
  PORTAL_STATUS_PAGE_WAIT_MS,
  PORTAL_STATUS_POLL_MS,
  PORTAL_STATUS_SELECTORS,
} from '../constants';
import type { PortalDomContext } from '../types/portal-dom-context.types';

type HiddenArg = {
  attentionModalId: string;
};

const isAttentionModalHidden = async (
  context: PortalDomContext,
): Promise<boolean> => {
  const arg: HiddenArg = {
    attentionModalId: PORTAL_STATUS_SELECTORS.attentionModalId,
  };

  return context.evaluate((a: HiddenArg) => {
    const byId = document.getElementById(a.attentionModalId);
    if (!byId) {
      return true;
    }
    if (byId.getAttribute('aria-hidden') === 'true') {
      return true;
    }
    if (!byId.classList.contains('show')) {
      const style = window.getComputedStyle(byId);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return true;
      }
    }
    const style = window.getComputedStyle(byId);
    return (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      Number(style.opacity) === 0
    );
  }, arg);
};

/**
 * Wait until `#scamAlert` Attention is hidden after Accept (REQ-006).
 */
export const waitForPortalAttentionModalHidden = async (
  context: PortalDomContext,
): Promise<{ ok: true } | { ok: false; error: string }> => {
  const deadline = Date.now() + PORTAL_STATUS_PAGE_WAIT_MS;

  if (await isAttentionModalHidden(context)) {
    return { ok: true };
  }

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, PORTAL_STATUS_POLL_MS));
    if (await isAttentionModalHidden(context)) {
      return { ok: true };
    }
  }

  return {
    ok: false,
    error: `Attention modal still visible after ${PORTAL_STATUS_PAGE_WAIT_MS}ms`,
  };
};
