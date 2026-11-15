import {
  PORTAL_ENTER_RESUME_HINT,
  PORTAL_ENTER_STUCK_POINT,
} from '../constants/portal-enter-error.constants';
import { PORTAL_SITE_HTTP_RESUME_HINT } from '../constants/portal-site-http-error.constants';

export type PortalEnterStuckPoint =
  (typeof PORTAL_ENTER_STUCK_POINT)[keyof typeof PORTAL_ENTER_STUCK_POINT];

export type PortalSiteHttpResumeHint =
  (typeof PORTAL_SITE_HTTP_RESUME_HINT)[keyof typeof PORTAL_SITE_HTTP_RESUME_HINT];

export type PortalEnterResumeHint =
  (typeof PORTAL_ENTER_RESUME_HINT)[keyof typeof PORTAL_ENTER_RESUME_HINT];

export type PortalStuckResumeHint =
  | PortalSiteHttpResumeHint
  | PortalEnterResumeHint
  | string;

/**
 * Logical evidence bag embedded into lastErrorMessage / attempt notes
 * (FR-8). No secrets — passwords/OTP/captcha solutions must never appear.
 */
export type PortalStuckEvidenceBag = {
  stuckPoint?: PortalEnterStuckPoint | string;
  pageUrl?: string;
  httpStatus?: number | null;
  resumeHint?: PortalStuckResumeHint;
  requestId?: string;
  guruMeditation?: string;
  blockedIp?: string;
  requestToken?: string;
  /** Heading / body recognition snippet (builder truncates ≤200). */
  recognitionText?: string;
};
