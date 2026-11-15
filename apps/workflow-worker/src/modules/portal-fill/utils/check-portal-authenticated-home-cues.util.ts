import {
  DEFAULT_PORTAL_HOME_PATH,
  PORTAL_HOME_MANAGE_APPOINTMENTS_TEXT,
  PORTAL_HOME_NEWAPPOINTMENT_HREF_SUBSTRING,
  PORTAL_HOME_DOORSTEP_HREF_SUBSTRING,
  PORTAL_HOME_VISA_PROCESS_HEADING,
} from '../constants';
import type {
  CheckPortalAuthenticatedHomeCuesInput,
  PortalAuthenticatedHomeCueCheckResult,
  PortalAuthenticatedHomeCueFlags,
} from '../types';

/**
 * Pure HOME_RECOGNIZED cue checker from URL + body/DOM flags (AC-2 / AC-3).
 * Header Login link presence is ignored for pass/fail.
 */
export const checkPortalAuthenticatedHomeCues = (
  input: CheckPortalAuthenticatedHomeCuesInput,
): PortalAuthenticatedHomeCueCheckResult => {
  const urlLower = (input.pageUrl ?? '').toLowerCase();
  const bodyLower = (input.bodyText ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const pathIncludesHome = urlLower.includes(
    DEFAULT_PORTAL_HOME_PATH.toLowerCase(),
  );
  const visaProcessHeadingPresent = bodyLower.includes(
    PORTAL_HOME_VISA_PROCESS_HEADING.toLowerCase(),
  );
  const manageAppointmentsPresent = bodyLower.includes(
    PORTAL_HOME_MANAGE_APPOINTMENTS_TEXT.toLowerCase(),
  );

  const cues: PortalAuthenticatedHomeCueFlags = {
    pathIncludesHome,
    visaProcessHeadingPresent,
    manageAppointmentsPresent,
    newappointmentCtaPresent: input.newappointmentCtaPresent === true,
    loginFormPrimary: input.loginFormPrimary === true,
    ...(input.headerLoginLinkPresent !== undefined
      ? { headerLoginLinkPresent: input.headerLoginLinkPresent }
      : {}),
  };

  const recognized =
    cues.pathIncludesHome &&
    cues.visaProcessHeadingPresent &&
    cues.manageAppointmentsPresent &&
    cues.newappointmentCtaPresent &&
    !cues.loginFormPrimary;

  return { recognized, cues };
};

/** True when href is doorstep (must never be booking entry). */
export const isPortalHomeDoorstepHref = (href: string): boolean =>
  (href ?? '')
    .toLowerCase()
    .includes(PORTAL_HOME_DOORSTEP_HREF_SUBSTRING.toLowerCase());

/** True when href is a newappointment booking CTA (not doorstep). */
export const isPortalHomeNewappointmentHref = (href: string): boolean => {
  const lower = (href ?? '').toLowerCase();
  if (isPortalHomeDoorstepHref(lower)) {
    return false;
  }
  return lower.includes(PORTAL_HOME_NEWAPPOINTMENT_HREF_SUBSTRING.toLowerCase());
};
