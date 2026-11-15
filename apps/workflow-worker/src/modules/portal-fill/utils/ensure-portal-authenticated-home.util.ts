import { Logger } from '@nestjs/common';
import {
  DEFAULT_PORTAL_HOME_PATH,
  PORTAL_ENTER_ERROR_CODE,
  PORTAL_ENTER_RESUME_HINT,
  PORTAL_ENTER_STUCK_POINT,
  PORTAL_HOME_RECOGNIZE_POLL_MS,
  PORTAL_HOME_RECOGNIZE_WAIT_MS,
  PORTAL_LOGIN_SITE_PROCESSING_ERROR_CODE,
  PORTAL_NAV_TIMEOUT_MS,
  PORTAL_SITE_HTTP_ERROR_CODE,
  PORTAL_SITE_HTTP_RESUME_HINT,
} from '../constants';
import type {
  EnsurePortalAuthenticatedHomeOptions,
  EnsurePortalAuthenticatedHomeResult,
  PortalPage,
  PortalStuckEvidenceBag,
} from '../types';
import { buildPortalStuckEvidenceMessage } from './build-portal-stuck-evidence-message.util';
import { classifyPortalSiteHttpErrorFromTextOrUnknown } from './classify-portal-site-http-error-from-text.util';
import { detectPortalLoginSiteProcessingAlert } from './detect-portal-login-site-processing-alert.util';
import { detectPortalSiteHttpError } from './detect-portal-site-http-error.util';
import { isPortalAuthenticatedHomeRecognized } from './is-portal-authenticated-home-recognized.util';
import { isPortalLoginFormVisibleAfterNav } from './is-portal-login-form-visible-after-nav.util';
import { settlePortalPageAfterLoginVerify } from './settle-portal-page-after-login-verify.util';
import { waitForPortalOverlaysClear } from './wait-for-portal-overlays-clear.util';

const logger = new Logger('ensurePortalAuthenticatedHome');

const failWithEvidence = (input: {
  errorCode: string;
  evidence: PortalStuckEvidenceBag;
  notes: string[];
}): EnsurePortalAuthenticatedHomeResult => {
  const error = buildPortalStuckEvidenceMessage(input.evidence);
  return {
    ok: false,
    errorCode: input.errorCode,
    error,
    evidence: input.evidence,
    notes: input.notes,
  };
};

/**
 * Ensure / wait for authenticated Global home (FR-1…FR-5).
 * Recognition order (FR-3): SITE_* → site-processing → session/login form →
 * overlays → home cues → else SITE_UI_UNKNOWN.
 */
export const ensurePortalAuthenticatedHome = async (
  page: PortalPage,
  options: EnsurePortalAuthenticatedHomeOptions,
): Promise<EnsurePortalAuthenticatedHomeResult> => {
  const notes: string[] = [];
  const waitMs = options.waitMs ?? PORTAL_HOME_RECOGNIZE_WAIT_MS;
  const homeUrl = options.homeUrl;

  const currentUrl = (() => {
    try {
      return page.url();
    } catch {
      return '';
    }
  })();

  const alreadyOnHome = currentUrl
    .toLowerCase()
    .includes(DEFAULT_PORTAL_HOME_PATH.toLowerCase());

  if (!alreadyOnHome) {
    try {
      await page.goto(homeUrl, {
        waitUntil: 'domcontentloaded',
        timeout: PORTAL_NAV_TIMEOUT_MS,
      });
      notes.push('navigated to portal home');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err ?? 'goto home failed');
      notes.push(`home navigation failed: ${message}`);
      // Continue into FR-3 classification on whatever page we landed on.
    }
  } else {
    notes.push('already on portal home path');
  }

  await settlePortalPageAfterLoginVerify(page);
  notes.push('home settle attempted');

  const classifyOnce = async (): Promise<EnsurePortalAuthenticatedHomeResult | null> => {
    // 1. SITE_* HTTP / WAF
    const siteHttp = await detectPortalSiteHttpError(page, {
      stuckPoint: PORTAL_ENTER_STUCK_POINT.AUTHENTICATED_LANDING,
    });
    if (siteHttp.present) {
      notes.push(`site_http=${siteHttp.code}`);
      return failWithEvidence({
        errorCode: siteHttp.code,
        evidence: siteHttp.evidence,
        notes,
      });
    }

    // 2. In-app login site-processing alert
    const siteProcessing = await detectPortalLoginSiteProcessingAlert(page);
    if (siteProcessing.present) {
      notes.push('site_processing_alert');
      const evidence: PortalStuckEvidenceBag = {
        stuckPoint: PORTAL_ENTER_STUCK_POINT.LOGIN,
        pageUrl: page.url(),
        resumeHint: PORTAL_ENTER_RESUME_HINT.RE_LOGIN,
        recognitionText: (siteProcessing.alertText ?? '').slice(0, 200),
      };
      return failWithEvidence({
        errorCode: PORTAL_LOGIN_SITE_PROCESSING_ERROR_CODE,
        evidence,
        notes,
      });
    }

    // 3. Session lost / login form still primary
    const loginPrimary = await isPortalLoginFormVisibleAfterNav(page);
    if (loginPrimary) {
      const onLoginPath = page
        .url()
        .toLowerCase()
        .includes('/global/account/login');
      const errorCode = onLoginPath
        ? PORTAL_ENTER_ERROR_CODE.ENTER_SESSION_LOST
        : PORTAL_ENTER_ERROR_CODE.ENTER_LOGIN_FORM_STILL_VISIBLE;
      notes.push(`login_form_primary code=${errorCode}`);
      const evidence: PortalStuckEvidenceBag = {
        stuckPoint: PORTAL_ENTER_STUCK_POINT.LOGIN,
        pageUrl: page.url(),
        resumeHint: PORTAL_ENTER_RESUME_HINT.RE_LOGIN,
        recognitionText: 'login form primary while expecting home',
      };
      return failWithEvidence({ errorCode, evidence, notes });
    }

    return null;
  };

  const early = await classifyOnce();
  if (early) {
    return early;
  }

  // 4. Overlays
  const overlays = await waitForPortalOverlaysClear(page, {
    waitMs: options.overlayWaitMs,
  });
  if (!overlays.clear) {
    notes.push(`overlay_stuck via=${overlays.via}`);
    logger.warn(`ensurePortalAuthenticatedHome overlays not clear: ${overlays.reason}`);
    const evidence: PortalStuckEvidenceBag = {
      stuckPoint: PORTAL_ENTER_STUCK_POINT.AUTHENTICATED_LANDING,
      pageUrl: page.url(),
      resumeHint: PORTAL_ENTER_RESUME_HINT.RELOAD_HOME,
      recognitionText: overlays.reason,
    };
    return failWithEvidence({
      errorCode: PORTAL_ENTER_ERROR_CODE.ENTER_OVERLAY_STUCK,
      evidence,
      notes,
    });
  }
  notes.push(`overlays_clear via=${overlays.via}`);

  // Re-check SITE_*/session after overlays (nav may have changed).
  const afterOverlay = await classifyOnce();
  if (afterOverlay) {
    return afterOverlay;
  }

  // 5. Home cue wait
  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    const recognized = await isPortalAuthenticatedHomeRecognized(page);
    if (recognized.recognized) {
      notes.push('HOME_RECOGNIZED');
      logger.log(
        `ensurePortalAuthenticatedHome success pageUrl=${recognized.pageUrl}`,
      );
      return { ok: true, pageUrl: recognized.pageUrl, notes };
    }

    // SITE_* may appear mid-wait
    const midSite = await detectPortalSiteHttpError(page, {
      stuckPoint: PORTAL_ENTER_STUCK_POINT.HOME_NOT_READY,
    });
    if (midSite.present) {
      notes.push(`site_http_mid_wait=${midSite.code}`);
      return failWithEvidence({
        errorCode: midSite.code,
        evidence: midSite.evidence,
        notes,
      });
    }

    const midLogin = await isPortalLoginFormVisibleAfterNav(page);
    if (midLogin) {
      notes.push('session_lost_mid_home_wait');
      const evidence: PortalStuckEvidenceBag = {
        stuckPoint: PORTAL_ENTER_STUCK_POINT.LOGIN,
        pageUrl: page.url(),
        resumeHint: PORTAL_ENTER_RESUME_HINT.RE_LOGIN,
        recognitionText: 'login form during home cue wait',
      };
      return failWithEvidence({
        errorCode: PORTAL_ENTER_ERROR_CODE.ENTER_SESSION_LOST,
        evidence,
        notes,
      });
    }

    await new Promise((resolve) =>
      setTimeout(resolve, PORTAL_HOME_RECOGNIZE_POLL_MS),
    );
  }

  const finalRecognition = await isPortalAuthenticatedHomeRecognized(page);
  if (finalRecognition.recognized) {
    notes.push('HOME_RECOGNIZED');
    return { ok: true, pageUrl: finalRecognition.pageUrl, notes };
  }

  // Final FR-3: if page looks like infra error, classify; else cues missing /
  // SITE_UI_UNKNOWN when chrome is unrecognizable.
  const finalSite = await detectPortalSiteHttpError(page, {
    stuckPoint: PORTAL_ENTER_STUCK_POINT.HOME_NOT_READY,
  });
  if (finalSite.present) {
    return failWithEvidence({
      errorCode: finalSite.code,
      evidence: finalSite.evidence,
      notes,
    });
  }

  const missing: string[] = [];
  const cues = finalRecognition.cues;
  if (!cues.pathIncludesHome) missing.push('path');
  if (!cues.visaProcessHeadingPresent) missing.push('visa_process');
  if (!cues.manageAppointmentsPresent) missing.push('manage_appointments');
  if (!cues.newappointmentCtaPresent) missing.push('newappointment_cta');
  if (cues.loginFormPrimary) missing.push('login_form_primary');

  // Incomplete portal chrome → ENTER_HOME_CUES_MISSING; blank/unknown → SITE_UI_UNKNOWN
  const bodyText = await page
    .evaluate(() => document.body?.innerText ?? '')
    .catch(() => '');
  const looksLikePortal =
    cues.pathIncludesHome ||
    cues.visaProcessHeadingPresent ||
    cues.manageAppointmentsPresent ||
    (bodyText?.length ?? 0) > 80;

  if (!looksLikePortal) {
    const unknown = classifyPortalSiteHttpErrorFromTextOrUnknown({
      bodyText: bodyText ?? '',
    });
    notes.push('SITE_UI_UNKNOWN after home cue timeout');
    const evidence: PortalStuckEvidenceBag = {
      stuckPoint: PORTAL_ENTER_STUCK_POINT.HOME_NOT_READY,
      pageUrl: finalRecognition.pageUrl,
      resumeHint: PORTAL_SITE_HTTP_RESUME_HINT.ESCALATE_AFTER_BOUNDED_RETRY,
      recognitionText: unknown.recognitionText,
    };
    return failWithEvidence({
      errorCode: PORTAL_SITE_HTTP_ERROR_CODE.SITE_UI_UNKNOWN,
      evidence,
      notes,
    });
  }

  notes.push(`home_cues_missing missing=${missing.join(',')}`);
  const evidence: PortalStuckEvidenceBag = {
    stuckPoint: PORTAL_ENTER_STUCK_POINT.HOME_NOT_READY,
    pageUrl: finalRecognition.pageUrl,
    resumeHint: PORTAL_ENTER_RESUME_HINT.GOTO_HOME_REASSERT,
    recognitionText: `missing:${missing.join(',')}`,
  };
  return failWithEvidence({
    errorCode: PORTAL_ENTER_ERROR_CODE.ENTER_HOME_CUES_MISSING,
    evidence,
    notes,
  });
};
