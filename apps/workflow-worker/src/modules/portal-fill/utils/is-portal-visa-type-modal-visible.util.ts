import { PORTAL_STATUS_SELECTORS } from '../constants';
import type { PortalPage } from '../types';

type ModalArg = {
  modalId: string;
  titleText: string;
};

/**
 * True when `#visaTypeModal` (Location & Visa Type) is currently visible.
 * Non-waiting probe for Add-path resume live evidence.
 */
export const isPortalVisaTypeModalVisible = async (
  page: PortalPage,
): Promise<boolean> => {
  const arg: ModalArg = {
    modalId: PORTAL_STATUS_SELECTORS.visaTypeModalId,
    titleText: PORTAL_STATUS_SELECTORS.visaTypeModalTitleText,
  };

  return page.evaluate((a: ModalArg) => {
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim().toLowerCase();
    const byId = document.getElementById(a.modalId);
    if (byId instanceof HTMLElement) {
      const style = window.getComputedStyle(byId);
      const displayed =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity) > 0;
      const shownClass = byId.classList.contains('show');
      const ariaModal = byId.getAttribute('aria-modal') === 'true';
      if (displayed || shownClass || ariaModal) {
        return true;
      }
    }
    const titleNeedle = collapse(a.titleText);
    const titles = Array.from(
      document.querySelectorAll('.modal-title, h6.modal-title'),
    );
    return titles.some((el) => {
      if (!collapse(el.textContent ?? '').includes(titleNeedle)) {
        return false;
      }
      const modal = el.closest('.modal');
      if (!(modal instanceof HTMLElement)) {
        return false;
      }
      return (
        modal.classList.contains('show') ||
        modal.getAttribute('aria-modal') === 'true' ||
        window.getComputedStyle(modal).display !== 'none'
      );
    });
  }, arg);
};
