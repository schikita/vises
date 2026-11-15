import { PORTAL_BOOKING_SELECTORS } from '../constants';
import type { PortalPage } from '../types';

type CueArg = {
  pageHeading: string;
  formActionSubstring: string;
};

/**
 * True when full-page Visa Type Selection is reachable (CON-008).
 * Prefers page heading + VisaType form action — never Manage
 * `#visaTypeModal` / `#LocationId` / `#VisaType` as this form.
 */
export const isPortalBookingSelectionUiVisible = async (
  page: PortalPage,
): Promise<boolean> => {
  const arg: CueArg = {
    pageHeading: PORTAL_BOOKING_SELECTORS.visaTypeSelectionHeading,
    formActionSubstring: PORTAL_BOOKING_SELECTORS.visaTypeFormActionSubstring,
  };

  return page.evaluate((a: CueArg) => {
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim().toLowerCase();

    const body = collapse(document.body?.textContent ?? '');
    if (body.includes(collapse(a.pageHeading))) return true;

    const forms = Array.from(document.querySelectorAll('form'));
    return forms.some((f) =>
      (f.getAttribute('action') ?? '').includes(a.formActionSubstring),
    );
  }, arg);
};
