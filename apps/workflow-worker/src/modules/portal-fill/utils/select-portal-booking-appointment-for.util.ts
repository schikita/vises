import { PORTAL_BOOKING_SELECTORS } from '../constants';
import type { PortalPage } from '../types';
import type { SelectPortalBookingAppointmentForResult } from '../types/select-portal-booking-appointment-for.types';

type SelectArg = {
  targetValue: string;
};

/**
 * Select Appointment For radio by **value** (Individual / Family). Prefer value
 * over obfuscated id/name suffixes (REQ-011). Clicks the control so portal
 * `OnAppointmentForChange` runs (Family opens `#familyDisclaimer`).
 */
export const selectPortalBookingAppointmentFor = async (
  page: PortalPage,
  target: 'Individual' | 'Family',
): Promise<SelectPortalBookingAppointmentForResult> => {
  const arg: SelectArg = {
    targetValue:
      target === 'Family'
        ? PORTAL_BOOKING_SELECTORS.familyRadioValue
        : PORTAL_BOOKING_SELECTORS.individualRadioValue,
  };

  const result = await page.evaluate((a: SelectArg) => {
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

    const radios = Array.from(
      document.querySelectorAll('input[type="radio"]'),
    ) as HTMLInputElement[];
    const matches = radios.filter(
      (r) =>
        collapse(r.value) === collapse(a.targetValue) &&
        isDisplayed(r.closest('.form-check, div') ?? r),
    );

    if (matches.length === 0) {
      return {
        ok: false as const,
        error: `appointment_for_no_${collapse(a.targetValue)}`,
        ambiguous: true,
      };
    }

    if (matches.length > 1) {
      const already = matches.filter((r) => r.checked);
      if (already.length === 1) {
        return {
          ok: true as const,
          applied: true,
          via: `already_${collapse(a.targetValue)}`,
        };
      }
      return {
        ok: false as const,
        error: `appointment_for_decoy_ambiguous_${collapse(a.targetValue)}`,
        ambiguous: true,
      };
    }

    const radio = matches[0];
    radio.click();
    radio.dispatchEvent(new Event('change', { bubbles: true }));
    return {
      ok: true as const,
      applied: true,
      via: `click_${collapse(a.targetValue)}`,
    };
  }, arg);

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      ambiguous: result.ambiguous,
    };
  }
  return { ok: true, applied: result.applied, via: result.via };
};
