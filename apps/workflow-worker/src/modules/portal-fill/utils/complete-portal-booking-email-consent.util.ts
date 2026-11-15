import { Logger } from '@nestjs/common';
import {
  TEMPORARY_EMAIL_DATA_PROTECTION_SUBJECT_INCLUDES,
  TEMPORARY_EMAIL_WAIT_FOR_EMAIL_MS,
} from '../../temporary-email';
import {
  PORTAL_BOOKING_CHECKPOINT_STEP,
  PORTAL_BOOKING_EMAIL_CONSENT_ERROR_CODE,
  PORTAL_BOOKING_EMAIL_CONSENT_OPEN_LINK_FAILED,
  PORTAL_NAV_TIMEOUT_MS,
} from '../constants';
import type {
  CompletePortalBookingEmailConsentOptions,
  CompletePortalBookingEmailConsentResult,
} from '../types/portal-booking-email-consent.types';
import { isPortalFillAbortRequested } from './is-portal-fill-abort-requested.util';

const logger = new Logger('completePortalBookingEmailConsent');

/**
 * Wait for BLS data-protection email, open green consent href only, persist
 * EMAIL_CONSENT_DONE (REQ-002…006 / DEC-002 / OQ-001 / NFR-002).
 * Never follows disagree CTA. Never logs body, token, or consent `data=` href.
 */
export const completePortalBookingEmailConsent = async (
  options: CompletePortalBookingEmailConsentOptions,
): Promise<CompletePortalBookingEmailConsentResult> => {
  const logPrefix = options.logPrefix ?? 'portal-booking-email-consent';
  const notes: string[] = [];

  if (options.alreadyConsented) {
    notes.push('email_consent_skipped_already_done');
    logger.log(`${logPrefix} phase=email_consent skipped already_done`);
    return { ok: true, skipped: true, notes };
  }

  if (isPortalFillAbortRequested(options.abortSignal)) {
    return {
      ok: false,
      error: 'email consent aborted',
      errorCode: PORTAL_BOOKING_EMAIL_CONSENT_ERROR_CODE.ABORTED,
      notes,
    };
  }

  notes.push('email_consent_pending');
  if (options.onCheckpoint) {
    await options.onCheckpoint({
      lastCompletedStep: PORTAL_BOOKING_CHECKPOINT_STEP.EMAIL_CONSENT_PENDING,
      dataProtectionConsentDone: false,
    });
  }

  const restoreAddress = options.mailbox.restoreAddress.trim();
  const contextKey = options.mailbox.contextKey.trim();
  if (!restoreAddress || !contextKey) {
    const error = 'retained mailbox restore address or contextKey missing';
    logger.error(`${logPrefix} phase=email_consent failure mailbox_missing`);
    return {
      ok: false,
      error,
      errorCode: PORTAL_BOOKING_EMAIL_CONSENT_ERROR_CODE.MAILBOX,
      notes,
    };
  }

  logger.log(`${logPrefix} phase=email_consent mailbox_open start`);
  try {
    await options.mailProvider.createAccount({
      contextKey,
      restoreAddress,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    logger.error(
      `${logPrefix} phase=email_consent failure mailbox_open ${detail.slice(0, 200)}`,
    );
    return {
      ok: false,
      error: `retained mailbox open failed: ${detail.slice(0, 300)}`,
      errorCode: PORTAL_BOOKING_EMAIL_CONSENT_ERROR_CODE.MAILBOX,
      notes,
    };
  }
  notes.push('email_consent_mailbox_opened');

  const timeoutMs = options.timeoutMs ?? TEMPORARY_EMAIL_WAIT_FOR_EMAIL_MS;
  logger.log(`${logPrefix} phase=email_consent wait_message start`);
  let messageId = '';
  let body = '';
  try {
    const latest = await options.mailProvider.waitLatestMessage({
      contextKey,
      token: options.mailbox.token,
      timeoutMs,
      unreadOnly: true,
      subjectIncludes: TEMPORARY_EMAIL_DATA_PROTECTION_SUBJECT_INCLUDES,
      includeExisting: true,
    });
    messageId = latest.messageId;
    body = latest.body;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    await options.mailProvider.disposeSession(contextKey).catch(() => undefined);
    logger.error(
      `${logPrefix} phase=email_consent failure wait_message ${detail.slice(0, 200)}`,
    );
    return {
      ok: false,
      error: `data-protection email wait failed: ${detail.slice(0, 300)}`,
      errorCode: PORTAL_BOOKING_EMAIL_CONSENT_ERROR_CODE.MESSAGE,
      notes,
    };
  }
  notes.push('email_consent_message_found');
  logger.log(
    `${logPrefix} phase=email_consent wait_message success messageId=${messageId}`,
  );

  const consentHref =
    options.mailProvider.extractDataProtectionConsentHref(body);
  body = '';
  if (!consentHref?.trim()) {
    await options.mailProvider.disposeSession(contextKey).catch(() => undefined);
    logger.error(`${logPrefix} phase=email_consent failure href_missing`);
    return {
      ok: false,
      error: 'data-protection consent href not found (green CTA)',
      errorCode: PORTAL_BOOKING_EMAIL_CONSENT_ERROR_CODE.HREF,
      notes,
    };
  }
  notes.push('email_consent_href_extracted');

  logger.log(`${logPrefix} phase=email_consent open_link start`);
  try {
    await options.page.goto(consentHref, {
      waitUntil: 'domcontentloaded',
      timeout: PORTAL_NAV_TIMEOUT_MS,
    });
  } catch {
    // Patchright/Playwright messages often embed the full navigation URL
    // (consent CTA / `data=`). Emit fixed phase code + OPEN only (NFR-002).
    await options.mailProvider.disposeSession(contextKey).catch(() => undefined);
    logger.error(
      `${logPrefix} phase=email_consent failure ${PORTAL_BOOKING_EMAIL_CONSENT_OPEN_LINK_FAILED}`,
    );
    return {
      ok: false,
      error: PORTAL_BOOKING_EMAIL_CONSENT_OPEN_LINK_FAILED,
      errorCode: PORTAL_BOOKING_EMAIL_CONSENT_ERROR_CODE.OPEN,
      notes,
    };
  }
  notes.push('email_consent_link_opened');
  logger.log(`${logPrefix} phase=email_consent open_link success`);

  await options.mailProvider.disposeSession(contextKey).catch(() => undefined);
  notes.push('email_consent_mailbox_disposed');

  if (options.onCheckpoint) {
    await options.onCheckpoint({
      lastCompletedStep: PORTAL_BOOKING_CHECKPOINT_STEP.EMAIL_CONSENT_DONE,
      dataProtectionConsentDone: true,
      dataProtectionMessageId: messageId,
    });
  }
  notes.push('email_consent_done');
  logger.log(`${logPrefix} phase=email_consent success`);

  return {
    ok: true,
    skipped: false,
    messageId,
    notes,
  };
};
