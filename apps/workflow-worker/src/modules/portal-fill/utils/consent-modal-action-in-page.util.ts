/// <reference lib="dom" />
/**
 * Single browser evaluate: inspect shown state or accept-only click (DEC-002, DEC-005).
 * Never targets disagree/reject/cancel (CON-006).
 *
 * RISK-003: must stay pure/serializable for page.evaluate — no Node captures.
 * Nested DOM helpers remain inside this function so they serialize with the body.
 */
import type { ConsentModalActionArg, ConsentModalActionResult } from '../types';

export const consentModalActionInPage = (
  arg: ConsentModalActionArg,
): ConsentModalActionResult => {
  const isVisible = (el: Element | null): boolean => {
    if (!el) return false;
    const html = el as HTMLElement;
    const style = window.getComputedStyle(html);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (style.opacity === '0') return false;
    return true;
  };

  const isShown = (el: Element | null): boolean => {
    if (!el || !isVisible(el)) return false;
    const html = el as HTMLElement;
    if (html.classList.contains('show')) return true;
    if (html.getAttribute('aria-modal') === 'true') return true;
    // Bootstrap sometimes sets inline display:block before/with .show
    if (html.style.display === 'block') return true;
    return false;
  };

  const findIdRoot = (selector: string): HTMLElement | null =>
    document.querySelector(selector) as HTMLElement | null;

  const findAttentionRoot = (): HTMLElement | null => {
    const modals = Array.from(document.querySelectorAll('.modal'));
    for (const modal of modals) {
      if (!isShown(modal)) continue;
      const content = modal.querySelector('.modal-content');
      if (!content) continue;
      const danger = content.querySelector('span.text-danger');
      const dangerText = (danger?.textContent ?? '').trim();
      if (dangerText === arg.attentionTitle) {
        return modal as HTMLElement;
      }
      const titleText = (
        content.querySelector('.modal-title, h1, h2, h3, h4, h5')
          ?.textContent ?? ''
      )
        .replace(/\s+/g, ' ')
        .trim();
      if (
        titleText === arg.attentionTitle ||
        titleText.startsWith(arg.attentionTitle)
      ) {
        return modal as HTMLElement;
      }
    }
    return null;
  };

  const findRoot = (): HTMLElement | null => {
    if (arg.stepId === 'alertModal') return findIdRoot(arg.alertRoot);
    if (arg.stepId === 'dpModal') return findIdRoot(arg.dpRoot);
    return findAttentionRoot();
  };

  const findAccept = (root: HTMLElement): HTMLElement | null => {
    if (arg.stepId === 'alertModal' || arg.stepId === 'dpModal') {
      const onclickNeedle =
        arg.stepId === 'alertModal' ? arg.alertOnclick : arg.dpOnclick;
      const byOnclick = root.querySelector(
        `button.btn-success[onclick*="${onclickNeedle}"], .btn-success[onclick*="${onclickNeedle}"]`,
      ) as HTMLElement | null;
      if (byOnclick && isVisible(byOnclick)) return byOnclick;
      const fallbacks = Array.from(
        root.querySelectorAll(
          'button.btn-success[data-bs-dismiss="modal"], .btn-success[data-bs-dismiss="modal"]',
        ),
      ) as HTMLElement[];
      return fallbacks.find((el) => isVisible(el)) ?? null;
    }

    const candidates = Array.from(
      root.querySelectorAll(
        'button.btn-success[data-bs-dismiss="modal"], .btn-success[data-bs-dismiss="modal"]',
      ),
    ) as HTMLElement[];
    const acceptNorm = arg.attentionAccept.trim().toLowerCase();
    return (
      candidates.find((el) => {
        if (!isVisible(el)) return false;
        const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
        const lower = text.toLowerCase();
        return lower === acceptNorm || lower.startsWith(acceptNorm);
      }) ?? null
    );
  };

  const root = findRoot();
  const shown = isShown(root);
  if (!shown) {
    return { shown: false, acceptFound: false, acceptReady: false };
  }

  const accept = findAccept(root as HTMLElement);
  const acceptFound = Boolean(accept);
  const acceptReady = Boolean(
    accept && isVisible(accept) && !(accept as HTMLButtonElement).disabled,
  );

  if (arg.action === 'inspect') {
    return { shown: true, acceptFound, acceptReady };
  }

  if (!accept || !acceptReady) {
    return {
      shown: true,
      acceptFound,
      acceptReady: false,
      clicked: false,
      error: `consent modal ${arg.stepId}: shown but accept control not found`,
    };
  }

  try {
    accept.scrollIntoView({ block: 'center', inline: 'nearest' });
    accept.click();
  } catch (err) {
    return {
      shown: true,
      acceptFound: true,
      acceptReady: true,
      clicked: false,
      error: `consent modal ${arg.stepId}: accept click failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  return {
    shown: true,
    acceptFound: true,
    acceptReady: true,
    clicked: true,
  };
};
