import {
  PORTAL_BOOKING_PAGE_WAIT_MS,
  PORTAL_BOOKING_SELECTORS,
} from '../constants';
import type { PortalPage } from '../types';
import { isPortalBookingSelectionUiVisible } from './is-portal-booking-selection-ui-visible.util';

type CueArg = {
  pageHeading: string;
  formActionSubstring: string;
};

/**
 * Wait until full-page Visa Type Selection is reachable (CON-008).
 * Prefers heading `Book New Appointment - Visa Type Selection` and form
 * action containing `/Global/Appointment/VisaType` — not Manage
 * `#visaTypeModal`.
 */
export const waitForPortalBookingSelectionUi = async (
  page: PortalPage,
): Promise<{ ok: true } | { ok: false; error: string }> => {
  const arg: CueArg = {
    pageHeading: PORTAL_BOOKING_SELECTORS.visaTypeSelectionHeading,
    formActionSubstring: PORTAL_BOOKING_SELECTORS.visaTypeFormActionSubstring,
  };

  try {
    await page.waitForFunction(
      (a: CueArg) => {
        const collapse = (text: string): string =>
          text.replace(/\s+/g, ' ').trim().toLowerCase();

        const body = collapse(document.body?.textContent ?? '');
        if (body.includes(collapse(a.pageHeading))) return true;

        const forms = Array.from(document.querySelectorAll('form'));
        return forms.some((f) =>
          (f.getAttribute('action') ?? '').includes(a.formActionSubstring),
        );
      },
      arg,
      { timeout: PORTAL_BOOKING_PAGE_WAIT_MS },
    );

    const visible = await isPortalBookingSelectionUiVisible(page);
    if (!visible) {
      return {
        ok: false,
        error: 'booking selection UI wait resolved but cues not visible',
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: `Booking selection UI not ready within ${PORTAL_BOOKING_PAGE_WAIT_MS}ms`,
    };
  }
};
