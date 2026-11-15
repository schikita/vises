import {
  PORTAL_BOOKING_CATEGORY,
  PORTAL_BOOKING_CATEGORY_CODE,
} from '../constants/portal-booking-category.constants';

const collapse = (text: string): string =>
  text.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * True when CRM category hint requires Premium Lounge (DEC-006 staff stop).
 */
export const isPortalBookingPremiumCategoryHint = (
  categoryHint: string | undefined,
): boolean => {
  const raw = categoryHint?.trim() ?? '';
  if (!raw) return false;
  const needle = collapse(raw);
  return (
    needle === collapse(PORTAL_BOOKING_CATEGORY.PREMIUM) ||
    needle === collapse(PORTAL_BOOKING_CATEGORY_CODE.PREMIUM)
  );
};
