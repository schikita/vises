import {
  PORTAL_BOOKING_SELECTORS,
  PORTAL_NAV_TIMEOUT_MS,
} from '../constants';
import type { PortalPage } from '../types';

type ClickArg = {
  linkText: string;
  hrefSubstring: string;
};

/**
 * Click Manage Applicants "Book New Appointment" CTA
 * (`ready_book_status.html` → `/Global/appointment/newappointment`).
 */
export const clickPortalBookNewAppointment = async (
  page: PortalPage,
): Promise<{ ok: true } | { ok: false; error: string }> => {
  const arg: ClickArg = {
    linkText: PORTAL_BOOKING_SELECTORS.bookNewAppointmentLinkText,
    hrefSubstring: PORTAL_BOOKING_SELECTORS.bookNewAppointmentHrefSubstring,
  };

  try {
    await page.waitForFunction(
      (a: ClickArg) => {
        const collapse = (text: string): string =>
          text.replace(/\s+/g, ' ').trim().toLowerCase();
        const needle = collapse(a.linkText);
        const anchors = Array.from(document.querySelectorAll('a'));
        return anchors.some((aEl) => {
          const textOk = collapse(aEl.textContent ?? '') === needle;
          const hrefOk = (aEl.getAttribute('href') ?? '')
            .toLowerCase()
            .includes(a.hrefSubstring.toLowerCase());
          return textOk || hrefOk;
        });
      },
      arg,
      { timeout: PORTAL_NAV_TIMEOUT_MS },
    );
  } catch {
    return {
      ok: false,
      error: `Book New Appointment link not ready within ${PORTAL_NAV_TIMEOUT_MS}ms`,
    };
  }

  const clicked = await page.evaluate((a: ClickArg) => {
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim().toLowerCase();
    const needle = collapse(a.linkText);
    const anchors = Array.from(document.querySelectorAll('a'));
    const match = anchors.find((aEl) => {
      const textOk = collapse(aEl.textContent ?? '') === needle;
      const hrefOk = (aEl.getAttribute('href') ?? '')
        .toLowerCase()
        .includes(a.hrefSubstring.toLowerCase());
      return textOk || hrefOk;
    }) as HTMLAnchorElement | undefined;
    if (!match) {
      return { ok: false as const, reason: 'Book New Appointment link not found' };
    }
    match.click();
    return { ok: true as const };
  }, arg);

  if (!clicked.ok) {
    return { ok: false, error: clicked.reason };
  }
  return { ok: true };
};
