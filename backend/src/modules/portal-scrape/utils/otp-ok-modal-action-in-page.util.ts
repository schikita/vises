/// <reference lib="dom" />
/**
 * Browser evaluate: dismiss OTP Ok modal via DEC-002 cascade.
 * Pure/serializable for page.evaluate — no Node captures.
 */
import type {
  PortalOtpOkModalActionArg,
  PortalOtpOkModalActionResult,
} from '../types';

export const otpOkModalActionInPage = (
  arg: PortalOtpOkModalActionArg,
): PortalOtpOkModalActionResult => {
  const isVisible = (el: Element | null): boolean => {
    if (!el) return false;
    const html = el as HTMLElement;
    const style = window.getComputedStyle(html);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (style.opacity === '0') return false;
    return true;
  };

  const normalizeText = (text: string): string =>
    text.replace(/\s+/g, ' ').trim();

  const tryClick = (el: HTMLElement, via: string): PortalOtpOkModalActionResult => {
    if (!isVisible(el)) {
      return { ok: false, error: `Ok control not visible: ${via}` };
    }
    el.click();
    return { ok: true, via };
  };

  for (const selector of arg.preferredSelectors) {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el && isVisible(el)) {
      return tryClick(el, selector);
    }
  }

  const accepted = new Set(
    arg.okButtonTexts.map((t) => normalizeText(t).toLowerCase()),
  );

  for (const rootSel of arg.modalRootSelectors) {
    const roots = Array.from(document.querySelectorAll(rootSel));
    for (const root of roots) {
      if (!isVisible(root)) continue;
      const buttons = Array.from(
        root.querySelectorAll('button, [role="button"], .btn'),
      );
      for (const btn of buttons) {
        const label = normalizeText(btn.textContent ?? '').toLowerCase();
        if (!accepted.has(label)) continue;
        if (!isVisible(btn)) continue;
        return tryClick(
          btn as HTMLElement,
          `${rootSel} button[text=${label}]`,
        );
      }
    }
  }

  return {
    ok: false,
    error:
      'OTP Ok modal control not found (preferred selectors unmatched; text Ok/OK cascade missed)',
  };
};
