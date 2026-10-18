import {
  PORTAL_BOOKING_PAGE_WAIT_MS,
  PORTAL_BOOKING_SELECTORS,
} from '../constants';
import type { PortalPage } from '../types';
import { isPortalBookingSelectionUiVisible } from './is-portal-booking-selection-ui-visible.util';

type CueArg = {
  modalId: string;
  modalTitleText: string;
  pageHeading: string;
  formActionSubstring: string;
  locationLabelText: string;
  visaTypeLabelText: string;
};

/**
 * Wait until booking location/visa selection UI is reachable (CON-006 stop).
 */
export const waitForPortalBookingSelectionUi = async (
  page: PortalPage,
): Promise<{ ok: true } | { ok: false; error: string }> => {
  const arg: CueArg = {
    modalId: PORTAL_BOOKING_SELECTORS.locationVisaModalId,
    modalTitleText: PORTAL_BOOKING_SELECTORS.locationVisaModalTitleText,
    pageHeading: PORTAL_BOOKING_SELECTORS.visaTypeSelectionHeading,
    formActionSubstring: PORTAL_BOOKING_SELECTORS.visaTypeFormActionSubstring,
    locationLabelText: PORTAL_BOOKING_SELECTORS.locationLabelText,
    visaTypeLabelText: PORTAL_BOOKING_SELECTORS.visaTypeLabelText,
  };

  try {
    await page.waitForFunction(
      (a: CueArg) => {
        const collapse = (text: string): string =>
          text.replace(/\s+/g, ' ').trim().toLowerCase();

        const isDisplayed = (el: Element | null): boolean => {
          if (!(el instanceof HTMLElement)) return false;
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return false;
          }
          if (Number(style.opacity) === 0) return false;
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        };

        const modal = document.getElementById(a.modalId);
        if (modal && isDisplayed(modal)) return true;

        const body = collapse(document.body?.textContent ?? '');
        if (body.includes(collapse(a.modalTitleText))) return true;
        if (body.includes(collapse(a.pageHeading))) return true;

        const forms = Array.from(document.querySelectorAll('form'));
        if (
          forms.some((f) =>
            (f.getAttribute('action') ?? '').includes(a.formActionSubstring),
          )
        ) {
          return true;
        }

        const labels = Array.from(document.querySelectorAll('label'));
        const hasLocation = labels.some(
          (lab) =>
            isDisplayed(lab) &&
            collapse(lab.textContent ?? '').includes(
              collapse(a.locationLabelText),
            ),
        );
        const hasVisa = labels.some(
          (lab) =>
            isDisplayed(lab) &&
            collapse(lab.textContent ?? '').includes(
              collapse(a.visaTypeLabelText),
            ),
        );
        return hasLocation && hasVisa;
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
