/// <reference lib="dom" />
import {
  PORTAL_REGISTER_SUCCESS_MESSAGE_CUE,
  PORTAL_REGISTER_SUCCESS_POLL_MS,
  PORTAL_REGISTER_SUCCESS_SELECTORS,
  PORTAL_REGISTER_SUCCESS_STATUS_TEXT,
  PORTAL_REGISTER_SUCCESS_WAIT_MS,
} from '../constants';
import type {
  PortalPage,
  PortalRegisterSuccessVerifyResult,
} from '../types';

/**
 * Verify RegisterUser landed on success cues from fixture `succes.html`
 * (REQ-007 / DEC-019 / DEC-005). Visibility-oriented: attached-hidden alone
 * is never success. Optional settle before polling (post-Submit).
 */
export const verifyPortalRegisterSuccess = async (
  page: PortalPage,
  options?: { waitMs?: number; settleMs?: number },
): Promise<PortalRegisterSuccessVerifyResult> => {
  const waitMs = options?.waitMs ?? PORTAL_REGISTER_SUCCESS_WAIT_MS;
  const settleMs = options?.settleMs ?? 0;
  const rootSel = PORTAL_REGISTER_SUCCESS_SELECTORS.root;

  if (settleMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, settleMs));
  }

  const deadline = Date.now() + waitMs;
  let lastReason = `${rootSel} not present within ${waitMs}ms`;

  while (Date.now() < deadline) {
    const probe = await page.evaluate(
      (arg: {
        rootSel: string;
        statusSel: string;
        messageSel: string;
        contSel: string;
        statusText: string;
        messageCue: string;
      }) => {
        const root = document.querySelector(arg.rootSel) as HTMLElement | null;
        if (!root) {
          return { ok: false as const, reason: `${arg.rootSel} missing` };
        }
        const style = window.getComputedStyle(root);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return { ok: false as const, reason: `${arg.rootSel} not visible` };
        }

        const statusEl = document.querySelector(
          arg.statusSel,
        ) as HTMLElement | null;
        const statusText = (statusEl?.textContent ?? '').trim();
        if (
          !statusText.toLowerCase().includes(arg.statusText.toLowerCase())
        ) {
          return {
            ok: false as const,
            reason: `${arg.statusSel} text mismatch`,
          };
        }

        const messageEl = document.querySelector(
          arg.messageSel,
        ) as HTMLElement | null;
        const messageText = (messageEl?.textContent ?? '').trim();
        if (
          !messageText.toLowerCase().includes(arg.messageCue.toLowerCase())
        ) {
          return {
            ok: false as const,
            reason: `${arg.messageSel} missing success cue`,
          };
        }

        const cont = document.querySelector(arg.contSel);
        if (!cont) {
          return {
            ok: false as const,
            reason: `${arg.contSel} missing`,
          };
        }

        return { ok: true as const, via: arg.rootSel };
      },
      {
        rootSel,
        statusSel: PORTAL_REGISTER_SUCCESS_SELECTORS.status,
        messageSel: PORTAL_REGISTER_SUCCESS_SELECTORS.message,
        contSel: PORTAL_REGISTER_SUCCESS_SELECTORS.continueButton,
        statusText: PORTAL_REGISTER_SUCCESS_STATUS_TEXT,
        messageCue: PORTAL_REGISTER_SUCCESS_MESSAGE_CUE,
      },
    );

    if (probe.ok) {
      return { ok: true, via: probe.via };
    }
    lastReason = probe.reason;

    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      break;
    }
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(PORTAL_REGISTER_SUCCESS_POLL_MS, remaining)),
    );
  }

  return { ok: false, reason: lastReason };
};
