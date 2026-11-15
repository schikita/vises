import {
  PORTAL_HOME_BOOK_NEW_APPOINTMENT_TEXT,
  PORTAL_HOME_DOORSTEP_HREF_SUBSTRING,
  PORTAL_HOME_NEWAPPOINTMENT_HREF_SUBSTRING,
} from '../constants';
import type {
  IsPortalAuthenticatedHomeRecognizedResult,
  PortalPage,
} from '../types';
import { checkPortalAuthenticatedHomeCues } from './check-portal-authenticated-home-cues.util';
import { isPortalLoginFormVisibleAfterNav } from './is-portal-login-form-visible-after-nav.util';
import { isPortalNavigationContextDestroyedError } from './is-portal-navigation-context-destroyed-error.util';

type HomeDomProbeResult = {
  bodyText: string;
  newappointmentCtaPresent: boolean;
  headerLoginLinkPresent: boolean;
};

type HomeDomProbeArg = {
  newappointmentHrefSubstring: string;
  doorstepHrefSubstring: string;
  bookNewAppointmentText: string;
};

/**
 * Probe authenticated home recognition (FR-2). Header Login lock is NOT
 * treated as auth-negative (AC-3).
 */
export const isPortalAuthenticatedHomeRecognized = async (
  page: PortalPage,
): Promise<IsPortalAuthenticatedHomeRecognizedResult> => {
  let pageUrl = '';
  try {
    pageUrl = page.url();
  } catch {
    pageUrl = '';
  }

  let loginFormPrimary = false;
  try {
    loginFormPrimary = await isPortalLoginFormVisibleAfterNav(page);
  } catch (err) {
    if (!isPortalNavigationContextDestroyedError(err)) {
      throw err;
    }
    loginFormPrimary = false;
  }

  const arg: HomeDomProbeArg = {
    newappointmentHrefSubstring: PORTAL_HOME_NEWAPPOINTMENT_HREF_SUBSTRING,
    doorstepHrefSubstring: PORTAL_HOME_DOORSTEP_HREF_SUBSTRING,
    bookNewAppointmentText: PORTAL_HOME_BOOK_NEW_APPOINTMENT_TEXT,
  };

  let dom: HomeDomProbeResult = {
    bodyText: '',
    newappointmentCtaPresent: false,
    headerLoginLinkPresent: false,
  };

  try {
    dom = await page.evaluate((a: HomeDomProbeArg) => {
      const collapse = (text: string): string =>
        text.replace(/\s+/g, ' ').trim().toLowerCase();
      const bodyText = document.body?.innerText ?? '';
      const anchors = Array.from(document.querySelectorAll('a'));
      let newappointmentCtaPresent = false;
      for (const aEl of anchors) {
        const href = (aEl.getAttribute('href') ?? '').toLowerCase();
        if (href.includes(a.doorstepHrefSubstring.toLowerCase())) {
          continue;
        }
        if (href.includes(a.newappointmentHrefSubstring.toLowerCase())) {
          newappointmentCtaPresent = true;
          break;
        }
        const textOk =
          collapse(aEl.textContent ?? '') ===
          collapse(a.bookNewAppointmentText);
        if (
          textOk &&
          href.includes(a.newappointmentHrefSubstring.toLowerCase())
        ) {
          newappointmentCtaPresent = true;
          break;
        }
      }
      const headerLoginLinkPresent = Boolean(
        document.querySelector('.login-link') ||
          Array.from(document.querySelectorAll('a')).some((el) => {
            const t = collapse(el.textContent ?? '');
            return (
              t === 'login' &&
              (el.getAttribute('href') ?? '')
                .toLowerCase()
                .includes('/global/account/login')
            );
          }),
      );
      return { bodyText, newappointmentCtaPresent, headerLoginLinkPresent };
    }, arg);
  } catch (err) {
    if (!isPortalNavigationContextDestroyedError(err)) {
      throw err;
    }
  }

  const checked = checkPortalAuthenticatedHomeCues({
    pageUrl,
    bodyText: dom.bodyText,
    loginFormPrimary,
    newappointmentCtaPresent: dom.newappointmentCtaPresent,
    headerLoginLinkPresent: dom.headerLoginLinkPresent,
  });

  return {
    recognized: checked.recognized,
    cues: checked.cues,
    pageUrl,
  };
};
