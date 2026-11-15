import {
  PORTAL_BOOKING_PAGE_WAIT_MS,
  PORTAL_BOOKING_SELECTORS,
} from '../constants';
import type { PortalPage } from '../types';

/**
 * Wait until the Number Of Members label is visible (Family path after Accept).
 */
export const waitForPortalBookingMembersLabel = async (
  page: PortalPage,
): Promise<boolean> => {
  const labelText = PORTAL_BOOKING_SELECTORS.numberOfMembersLabelText;
  try {
    await page.waitForFunction(
      (needle: string) => {
        const collapse = (text: string): string =>
          text.replace(/\s+/g, ' ').trim().toLowerCase();
        const target = collapse(needle);
        const labels = Array.from(document.querySelectorAll('label'));
        return labels.some((lab) => {
          if (!(lab instanceof HTMLElement)) return false;
          if (!collapse(lab.textContent ?? '').includes(target)) return false;
          const style = window.getComputedStyle(lab);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return false;
          }
          const wrap = lab.closest('div');
          if (wrap instanceof HTMLElement) {
            const wrapStyle = window.getComputedStyle(wrap);
            if (
              wrapStyle.display === 'none' ||
              wrapStyle.visibility === 'hidden'
            ) {
              return false;
            }
          }
          return true;
        });
      },
      labelText,
      { timeout: PORTAL_BOOKING_PAGE_WAIT_MS },
    );
    return true;
  } catch {
    return false;
  }
};
