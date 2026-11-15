/// <reference lib="dom" />
import { PORTAL_BOOKING_SELECTORS } from '../constants';
import type { PortalBookingPremiumOrPaymentSurface } from '../types/portal-booking-premium-or-payment-surface.types';
import type { PortalPage } from '../types';

type SurfaceArg = {
  premiumLoungeModalId: string;
  payConfirmModalLabelId: string;
  premiumCategoryConfirmationTitleText: string;
};

/**
 * Detect Premium Lounge / payment confirm surfaces for hard-stop
 * (CON-004 / DEC-001). Detection only — never Accept or confirm.
 */
export const isPortalBookingPremiumOrPaymentSurfaceVisible = async (
  page: PortalPage,
): Promise<PortalBookingPremiumOrPaymentSurface | null> => {
  const arg: SurfaceArg = {
    premiumLoungeModalId: PORTAL_BOOKING_SELECTORS.premiumLoungeModalId,
    payConfirmModalLabelId: PORTAL_BOOKING_SELECTORS.payConfirmModalLabelId,
    premiumCategoryConfirmationTitleText:
      PORTAL_BOOKING_SELECTORS.premiumCategoryConfirmationTitleText,
  };

  return page.evaluate((a: SurfaceArg) => {
    const collapse = (text: string): string =>
      text.replace(/\s+/g, ' ').trim().toLowerCase();
    const isVisible = (el: Element | null): boolean => {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }
      if (el.classList.contains('show')) {
        return true;
      }
      return true;
    };

    const premium = document.getElementById(a.premiumLoungeModalId);
    if (isVisible(premium)) {
      return 'premium_lounge_accept' as const;
    }

    const payLabel = document.getElementById(a.payConfirmModalLabelId);
    if (isVisible(payLabel)) {
      return 'payment_confirm' as const;
    }

    const titleNeedle = collapse(a.premiumCategoryConfirmationTitleText);
    const titles = Array.from(
      document.querySelectorAll('.modal-title, h6.modal-title, .modal'),
    );
    const premiumTitleVisible = titles.some((el) => {
      if (!collapse(el.textContent ?? '').includes(titleNeedle)) {
        return false;
      }
      return isVisible(el);
    });
    if (premiumTitleVisible) {
      return 'premium_lounge_accept' as const;
    }

    return null;
  }, arg);
};
