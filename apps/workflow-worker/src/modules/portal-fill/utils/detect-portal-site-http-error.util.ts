import type {
  DetectPortalSiteHttpErrorResult,
  PortalPage,
  PortalStuckEvidenceBag,
} from '../types';
import { PORTAL_ENTER_STUCK_POINT } from '../constants';
import { classifyPortalSiteHttpErrorFromText } from './classify-portal-site-http-error-from-text.util';
import { isPortalNavigationContextDestroyedError } from './is-portal-navigation-context-destroyed-error.util';

type DetectPortalSiteHttpErrorOptions = {
  httpStatus?: number | null;
  stuckPoint?: string;
};

/**
 * Page wrapper: read body text (+ optional status) and classify SITE_* (FR-6).
 * Host-independent — does not hardcode Belarus/Russia/global hosts.
 */
export const detectPortalSiteHttpError = async (
  page: PortalPage,
  options?: DetectPortalSiteHttpErrorOptions,
): Promise<DetectPortalSiteHttpErrorResult> => {
  let bodyText = '';
  let pageUrl = '';
  try {
    pageUrl = page.url();
    bodyText = await page.evaluate(() => document.body?.innerText ?? '');
  } catch (err) {
    if (isPortalNavigationContextDestroyedError(err)) {
      return { present: false };
    }
    throw err;
  }

  const classified = classifyPortalSiteHttpErrorFromText({
    bodyText,
    httpStatus: options?.httpStatus,
  });
  if (!classified.matched) {
    return { present: false };
  }

  const evidence: PortalStuckEvidenceBag = {
    stuckPoint: options?.stuckPoint ?? PORTAL_ENTER_STUCK_POINT.LOGIN,
    pageUrl,
    httpStatus: options?.httpStatus ?? null,
    resumeHint: classified.resumeHint,
    recognitionText: classified.recognitionText,
    ...(classified.requestId ? { requestId: classified.requestId } : {}),
    ...(classified.guruMeditation
      ? { guruMeditation: classified.guruMeditation }
      : {}),
    ...(classified.blockedIp ? { blockedIp: classified.blockedIp } : {}),
    ...(classified.requestToken
      ? { requestToken: classified.requestToken }
      : {}),
  };

  return {
    present: true,
    code: classified.code,
    evidence,
  };
};
