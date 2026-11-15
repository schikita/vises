import {
  PORTAL_BOOKING_CATEGORY,
  PORTAL_BOOKING_CATEGORY_CODE,
} from '../constants/portal-booking-category.constants';
import type { ResolvePortalBookingCategoryOptionResult } from '../types/resolve-portal-booking-category-option.types';
import { isPortalBookingPremiumCategoryHint } from './is-portal-booking-premium-category-hint.util';

const collapse = (text: string): string =>
  text.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Prefer Normal (DEC-006). Premium CRM → staff stop. Exact Prime Time when CRM
 * asks for it. Empty hint → Normal. Unknown → ambiguous (no guessing).
 */
export const resolvePortalBookingCategoryOption = (
  categoryHint: string | undefined,
): ResolvePortalBookingCategoryOptionResult => {
  const raw = categoryHint?.trim() ?? '';
  if (!raw) {
    return { kind: 'select', text: PORTAL_BOOKING_CATEGORY.NORMAL };
  }
  if (isPortalBookingPremiumCategoryHint(raw)) {
    return { kind: 'premium_staff_stop' };
  }
  const needle = collapse(raw);
  if (
    needle === collapse(PORTAL_BOOKING_CATEGORY.NORMAL) ||
    needle === collapse(PORTAL_BOOKING_CATEGORY_CODE.NORMAL)
  ) {
    return { kind: 'select', text: PORTAL_BOOKING_CATEGORY.NORMAL };
  }
  if (
    needle === collapse(PORTAL_BOOKING_CATEGORY.PRIME_TIME) ||
    needle === collapse(PORTAL_BOOKING_CATEGORY_CODE.PRIME_TIME)
  ) {
    return { kind: 'select', text: PORTAL_BOOKING_CATEGORY.PRIME_TIME };
  }
  return { kind: 'ambiguous' };
};
