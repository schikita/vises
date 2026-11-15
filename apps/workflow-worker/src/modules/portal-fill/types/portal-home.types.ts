import type { PortalEnterErrorCode } from './portal-enter-error.types';
import type { PortalSiteHttpErrorCode } from './portal-site-http-error.types';
import type { PortalStuckEvidenceBag } from './portal-stuck-evidence.types';

/** Pure cue checker input (URL + body/DOM flags; fixture-friendly). */
export type CheckPortalAuthenticatedHomeCuesInput = {
  pageUrl: string;
  bodyText: string;
  /** True when login email/password form is the active primary UI. */
  loginFormPrimary: boolean;
  /** True when at least one non-doorstep newappointment href exists. */
  newappointmentCtaPresent: boolean;
  /** Informational — header Login lock must NOT fail recognition. */
  headerLoginLinkPresent?: boolean;
};

/** Pure cue flags derived from URL + body/DOM (fixture-friendly). */
export type PortalAuthenticatedHomeCueFlags = {
  pathIncludesHome: boolean;
  visaProcessHeadingPresent: boolean;
  manageAppointmentsPresent: boolean;
  newappointmentCtaPresent: boolean;
  loginFormPrimary: boolean;
  /** Informational — must NOT fail recognition when true. */
  headerLoginLinkPresent?: boolean;
};

export type PortalAuthenticatedHomeCueCheckResult = {
  recognized: boolean;
  cues: PortalAuthenticatedHomeCueFlags;
};

/** Page recognition probe result. */
export type IsPortalAuthenticatedHomeRecognizedResult = {
  recognized: boolean;
  cues: PortalAuthenticatedHomeCueFlags;
  pageUrl: string;
};

/** Doorstep-safe newappointment CTA resolve result. */
export type ResolvePortalHomeNewappointmentCtaResult =
  | {
      ok: true;
      href: string;
      via: 'nav_book_new_appointment' | 'step_book_now' | 'href_newappointment';
    }
  | {
      ok: false;
      reason: string;
      doorstepOnly?: boolean;
    };

export type EnsurePortalAuthenticatedHomeOptions = {
  homeUrl: string;
  /** Override home cue wait (default PORTAL_HOME_RECOGNIZE_WAIT_MS). */
  waitMs?: number;
  /** Override overlay clear wait. */
  overlayWaitMs?: number;
};

export type EnsurePortalAuthenticatedHomeResult =
  | { ok: true; pageUrl: string; notes: string[] }
  | {
      ok: false;
      errorCode: PortalSiteHttpErrorCode | PortalEnterErrorCode | string;
      error: string;
      evidence: PortalStuckEvidenceBag;
      notes: string[];
    };
