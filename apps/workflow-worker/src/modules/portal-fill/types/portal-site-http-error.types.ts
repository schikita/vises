import { PORTAL_SITE_HTTP_ERROR_CODE } from '../constants/portal-site-http-error.constants';
import type { PortalStuckEvidenceBag } from './portal-stuck-evidence.types';

export type PortalSiteHttpErrorCode =
  (typeof PORTAL_SITE_HTTP_ERROR_CODE)[keyof typeof PORTAL_SITE_HTTP_ERROR_CODE];

/** Pure classifier input (host-independent). */
export type ClassifyPortalSiteHttpErrorFromTextInput = {
  bodyText: string;
  httpStatus?: number | null;
};

/** Pure classifier result — known SITE_* family or unknown. */
export type ClassifyPortalSiteHttpErrorFromTextResult =
  | {
      matched: true;
      code: PortalSiteHttpErrorCode;
      resumeHint: string;
      recognitionText: string;
      requestId?: string;
      guruMeditation?: string;
      blockedIp?: string;
      requestToken?: string;
    }
  | { matched: false };

/** Page-probe detector result. */
export type DetectPortalSiteHttpErrorResult =
  | {
      present: true;
      code: PortalSiteHttpErrorCode;
      evidence: PortalStuckEvidenceBag;
    }
  | { present: false };
