import {
  PORTAL_BOOKING_PAGE_WAIT_MS,
  PORTAL_BOOKING_SELECTORS,
} from '../constants';
import type { PortalPage } from '../types';

type ClickArg = {
  linkText: string;
  hrefSubstring: string;
};

/**
 * Click slots-unavailable "Try Again" (`a.btn.btn-primary` → `newappointment`)
 * (`slots-not-available.html` / REQ-014 / VT-TASK-009).
 */
export const clickPortalBookingTryAgain = async (
  page: PortalPage,
): Promise<{ ok: true; via: string } | { ok: false; error: string }> => {
  const arg: ClickArg = {
    linkText: PORTAL_BOOKING_SELECTORS.tryAgainLinkText,
    hrefSubstring: PORTAL_BOOKING_SELECTORS.tryAgainHrefSubstring,
  };

  try {
    await page.waitForFunction(
      (a: ClickArg) => {
        const collapse = (text: string): string =>
          text.replace(/\s+/g, ' ').trim().toLowerCase();
        const needle = collapse(a.linkText);
        const anchors = Array.from(
          document.querySelectorAll('a.btn.btn-primary, a.btn-primary, a'),
        );
        return anchors.some((aEl) => {
          const textOk = collapse(aEl.textContent ?? '') === needle;
          const hrefOk = (aEl.getAttribute('href') ?? '')
            .toLowerCase()
            .includes(a.hrefSubstring.toLowerCase());
          return textOk && hrefOk;
        });
      },
      arg,
      { timeout: PORTAL_BOOKING_PAGE_WAIT_MS },
    );
  } catch {
    return {
      ok: false,
      error: `Try Again link not ready within ${PORTAL_BOOKING_PAGE_WAIT_MS}ms`,
    };
  }

  const clicked = await page.evaluate((a: ClickArg) => {
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim().toLowerCase();
    const needle = collapse(a.linkText);
    const anchors = Array.from(
      document.querySelectorAll('a.btn.btn-primary, a.btn-primary, a'),
    );
    const match = anchors.find((aEl) => {
      const textOk = collapse(aEl.textContent ?? '') === needle;
      const hrefOk = (aEl.getAttribute('href') ?? '')
        .toLowerCase()
        .includes(a.hrefSubstring.toLowerCase());
      return textOk && hrefOk;
    }) as HTMLAnchorElement | undefined;
    if (!match) {
      return { ok: false as const, reason: 'Try Again link not found' };
    }
    match.click();
    return { ok: true as const, via: 'try_again_newappointment' };
  }, arg);

  if (!clicked.ok) {
    return { ok: false, error: clicked.reason };
  }
  return { ok: true, via: clicked.via };
};
