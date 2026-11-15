import {
  PORTAL_ENTER_ERROR_CODE,
  PORTAL_HOME_BOOK_NEW_APPOINTMENT_TEXT,
  PORTAL_HOME_DOORSTEP_HREF_SUBSTRING,
  PORTAL_HOME_NEWAPPOINTMENT_HREF_SUBSTRING,
} from '../constants';
import type {
  PortalPage,
  ResolvePortalHomeNewappointmentCtaResult,
} from '../types';
import { isPortalNavigationContextDestroyedError } from './is-portal-navigation-context-destroyed-error.util';

type CtaArg = {
  bookNewAppointmentText: string;
  newappointmentHrefSubstring: string;
  doorstepHrefSubstring: string;
  doorstepErrorCode: string;
};

type CtaEvalResult =
  | {
      ok: true;
      href: string;
      via: 'nav_book_new_appointment' | 'step_book_now' | 'href_newappointment';
    }
  | { ok: false; reason: string; doorstepOnly: boolean };

/**
 * Resolve a doorstep-safe booking CTA on authenticated home (FR-10 / AC-7).
 * Prefer nav "Book New Appointment"; never returns doorstepservice.
 */
export const resolvePortalHomeNewappointmentCta = async (
  page: PortalPage,
): Promise<ResolvePortalHomeNewappointmentCtaResult> => {
  const arg: CtaArg = {
    bookNewAppointmentText: PORTAL_HOME_BOOK_NEW_APPOINTMENT_TEXT,
    newappointmentHrefSubstring: PORTAL_HOME_NEWAPPOINTMENT_HREF_SUBSTRING,
    doorstepHrefSubstring: PORTAL_HOME_DOORSTEP_HREF_SUBSTRING,
    doorstepErrorCode: PORTAL_ENTER_ERROR_CODE.ENTER_WRONG_CTA_DOORSTEP,
  };

  try {
    const result = await page.evaluate((a: CtaArg): CtaEvalResult => {
      const collapse = (text: string): string =>
        text.replace(/\s+/g, ' ').trim().toLowerCase();
      const needle = collapse(a.bookNewAppointmentText);
      const anchors = Array.from(
        document.querySelectorAll('a'),
      ) as HTMLAnchorElement[];

      const isVisible = (el: Element): boolean => {
        let node: Element | null = el;
        while (node) {
          const style = window.getComputedStyle(node);
          if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.opacity === '0'
          ) {
            return false;
          }
          node = node.parentElement;
        }
        if (el.getAttribute('aria-hidden') === 'true') {
          return false;
        }
        const rect = el.getBoundingClientRect();
        return rect.width >= 1 && rect.height >= 1;
      };

      const isDoorstep = (href: string): boolean =>
        href.toLowerCase().includes(a.doorstepHrefSubstring.toLowerCase());
      const isNewAppt = (href: string): boolean =>
        href
          .toLowerCase()
          .includes(a.newappointmentHrefSubstring.toLowerCase()) &&
        !isDoorstep(href);

      let sawDoorstep = false;
      for (const aEl of anchors) {
        const href = aEl.getAttribute('href') ?? '';
        if (isDoorstep(href)) {
          sawDoorstep = true;
          continue;
        }
      }

      // Prefer nav Book New Appointment.
      for (const aEl of anchors) {
        const href = aEl.getAttribute('href') ?? '';
        if (!isNewAppt(href)) continue;
        if (collapse(aEl.textContent ?? '') !== needle) continue;
        if (!isVisible(aEl)) continue;
        return {
          ok: true,
          href,
          via: 'nav_book_new_appointment',
        };
      }

      // Step 2 Book Now with newappointment href (visible, not cloned/hidden).
      for (const aEl of anchors) {
        const href = aEl.getAttribute('href') ?? '';
        if (!isNewAppt(href)) continue;
        if (collapse(aEl.textContent ?? '') !== 'book now') continue;
        if (!isVisible(aEl)) continue;
        return { ok: true, href, via: 'step_book_now' };
      }

      // Any visible newappointment href.
      for (const aEl of anchors) {
        const href = aEl.getAttribute('href') ?? '';
        if (!isNewAppt(href)) continue;
        if (!isVisible(aEl)) continue;
        return { ok: true, href, via: 'href_newappointment' };
      }

      if (sawDoorstep) {
        return {
          ok: false,
          reason: a.doorstepErrorCode,
          doorstepOnly: true,
        };
      }
      return {
        ok: false,
        reason: 'newappointment CTA not found',
        doorstepOnly: false,
      };
    }, arg);

    if (!result.ok) {
      return {
        ok: false,
        reason: result.reason,
        ...(result.doorstepOnly ? { doorstepOnly: true } : {}),
      };
    }
    return result;
  } catch (err) {
    if (isPortalNavigationContextDestroyedError(err)) {
      return {
        ok: false,
        reason: 'navigation context destroyed during CTA resolve',
      };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, reason: message };
  }
};
