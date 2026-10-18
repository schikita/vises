import { PORTAL_BOOKING_SELECTORS } from '../constants';
import type { PortalPage } from '../types';

type CueArg = {
  modalId: string;
  modalTitleText: string;
  pageHeading: string;
  formActionSubstring: string;
  locationLabelText: string;
  visaTypeLabelText: string;
};

/**
 * True when location/visa booking selection UI is reachable
 * (`slect_location_visa_type.html` modal and/or `book_new_appointment.html`).
 */
export const isPortalBookingSelectionUiVisible = async (
  page: PortalPage,
): Promise<boolean> => {
  const arg: CueArg = {
    modalId: PORTAL_BOOKING_SELECTORS.locationVisaModalId,
    modalTitleText: PORTAL_BOOKING_SELECTORS.locationVisaModalTitleText,
    pageHeading: PORTAL_BOOKING_SELECTORS.visaTypeSelectionHeading,
    formActionSubstring: PORTAL_BOOKING_SELECTORS.visaTypeFormActionSubstring,
    locationLabelText: PORTAL_BOOKING_SELECTORS.locationLabelText,
    visaTypeLabelText: PORTAL_BOOKING_SELECTORS.visaTypeLabelText,
  };

  return page.evaluate((a: CueArg) => {
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
    if (modal && isDisplayed(modal)) {
      return true;
    }

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
        collapse(lab.textContent ?? '').includes(collapse(a.locationLabelText)),
    );
    const hasVisa = labels.some(
      (lab) =>
        isDisplayed(lab) &&
        collapse(lab.textContent ?? '').includes(
          collapse(a.visaTypeLabelText),
        ),
    );
    return hasLocation && hasVisa;
  }, arg);
};
