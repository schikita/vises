/// <reference lib="dom" />
import {
  PORTAL_REGISTER_SUCCESS_MESSAGE_CUE,
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
 * (REQ-007 / DEC-019). Does not click; safe to call before/after submit.
 */
export const verifyPortalRegisterSuccess = async (
  page: PortalPage,
  options?: { waitMs?: number },
): Promise<PortalRegisterSuccessVerifyResult> => {
  const waitMs = options?.waitMs ?? PORTAL_REGISTER_SUCCESS_WAIT_MS;
  const rootSel = PORTAL_REGISTER_SUCCESS_SELECTORS.root;

  try {
    await page.waitForSelector(rootSel, {
      state: 'attached',
      timeout: waitMs,
    });
  } catch {
    return {
      ok: false,
      reason: `${rootSel} not present within ${waitMs}ms`,
    };
  }

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

  if (!probe.ok) {
    return { ok: false, reason: probe.reason };
  }
  return { ok: true, via: probe.via };
};
