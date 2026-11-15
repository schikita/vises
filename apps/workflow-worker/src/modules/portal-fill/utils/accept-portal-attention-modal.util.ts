import {
  PORTAL_NAV_TIMEOUT_MS,
  PORTAL_STATUS_POLL_MS,
  PORTAL_STATUS_SELECTORS,
} from '../constants';
import type { PortalDomContext } from '../types/portal-dom-context.types';

type ModalArg = {
  attentionModalId: string;
  attentionTitleText: string;
  attentionAcceptButtonText: string;
};

const buildArg = (): ModalArg => ({
  attentionModalId: PORTAL_STATUS_SELECTORS.attentionModalId,
  attentionTitleText: PORTAL_STATUS_SELECTORS.attentionTitleText,
  attentionAcceptButtonText: PORTAL_STATUS_SELECTORS.attentionAcceptButtonText,
});

/**
 * Accept the Attention modal when present
 * (`modal_attention_app_editing.html`); no-op when absent.
 * Runs in top document or Edit Member iframe (REQ-006).
 */
export const acceptPortalAttentionModal = async (
  context: PortalDomContext,
): Promise<
  | { ok: true; accepted: boolean; via?: string }
  | { ok: false; error: string }
> => {
  const arg = buildArg();

  const present = await context.evaluate((a: ModalArg) => {
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim().toLowerCase();
    const byId = document.getElementById(a.attentionModalId);
    if (byId) {
      const style = window.getComputedStyle(byId);
      if (style.display !== 'none' && style.visibility !== 'hidden') {
        return true;
      }
      if (byId.classList.contains('show')) {
        return true;
      }
    }
    const titleNeedle = collapse(a.attentionTitleText);
    const titles = Array.from(
      document.querySelectorAll('.modal-title, h6.modal-title, .modal'),
    );
    return titles.some((el) =>
      collapse(el.textContent ?? '').includes(titleNeedle),
    );
  }, arg);

  if (!present) {
    return { ok: true, accepted: false };
  }

  const deadline = Date.now() + PORTAL_NAV_TIMEOUT_MS;
  let acceptReady = false;
  while (Date.now() < deadline) {
    acceptReady = await context.evaluate((a: ModalArg) => {
      const collapse = (text: string): string =>
        text.replace(/\s+/g, ' ').trim().toLowerCase();
      const needle = collapse(a.attentionAcceptButtonText);
      const buttons = Array.from(
        document.querySelectorAll(
          'button.btn-success, .modal-footer button, button[data-bs-dismiss="modal"]',
        ),
      );
      return buttons.some((btn) => {
        const label = collapse(btn.textContent ?? '');
        if (label !== needle) return false;
        if ('disabled' in btn && (btn as HTMLButtonElement).disabled) {
          return false;
        }
        return true;
      });
    }, arg);
    if (acceptReady) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, PORTAL_STATUS_POLL_MS));
  }

  if (!acceptReady) {
    return {
      ok: false,
      error: `Attention Accept not ready within ${PORTAL_NAV_TIMEOUT_MS}ms`,
    };
  }

  const clicked = await context.evaluate((a: ModalArg) => {
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim().toLowerCase();
    const needle = collapse(a.attentionAcceptButtonText);
    const btn = Array.from(
      document.querySelectorAll(
        'button.btn-success, .modal-footer button, button[data-bs-dismiss="modal"]',
      ),
    ).find((el) => collapse(el.textContent ?? '') === needle) as
      | HTMLButtonElement
      | undefined;
    if (!btn || btn.disabled) {
      return { ok: false as const, via: 'not-ready' };
    }
    btn.click();
    return { ok: true as const, via: a.attentionAcceptButtonText };
  }, arg);

  if (!clicked.ok) {
    return {
      ok: false,
      error: `Attention Accept click failed (${clicked.via})`,
    };
  }
  return { ok: true, accepted: true, via: clicked.via };
};
