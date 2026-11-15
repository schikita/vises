import { Logger } from '@nestjs/common';
import { classifyPortalBookingUnsafeAction } from '../../bls-workflow/utils/classify-portal-booking-unsafe-action.util';
import {
  PORTAL_BOOKING_CHECKPOINT_OUTCOME,
  PORTAL_BOOKING_CHECKPOINT_STEP,
  PORTAL_BOOKING_CHECKPOINT_STUCK_CODE,
  PORTAL_NAV_TIMEOUT_MS,
} from '../constants';
import type {
  PortalBookingPrefillOutcome,
  PortalPage,
  RunPortalBookingContinuePipelineOptions,
  RunPortalBookingContinuePipelineResult,
} from '../types';
import type { PortalBookingPremiumOrPaymentSurface } from '../types/portal-booking-premium-or-payment-surface.types';
import { acceptPortalAttentionModal } from './accept-portal-attention-modal.util';
import { assertPortalManageApplicantsReadyForBook } from './assert-portal-manage-applicants-ready-for-book.util';
import { clickPortalBookNewAppointment } from './click-portal-book-new-appointment.util';
import { clickPortalVisaTypeSubmit } from './click-portal-visa-type-submit.util';
import { completePortalBookingEmailConsent } from './complete-portal-booking-email-consent.util';
import { ensurePortalAuthenticatedHome } from './ensure-portal-authenticated-home.util';
import { isPortalBookingPremiumOrPaymentSurfaceVisible } from './is-portal-booking-premium-or-payment-surface-visible.util';
import { isPortalBookingSelectionUiVisible } from './is-portal-booking-selection-ui-visible.util';
import { prefillPortalBookingSelectionFields } from './prefill-portal-booking-selection-fields.util';
import { runPortalBookingCaptchaPhase } from './run-portal-booking-captcha-phase.util';
import { runPortalBookingSlotsUnavailablePhase } from './run-portal-booking-slots-unavailable-phase.util';
import { runPortalLoginPrepPipeline } from './run-portal-login-prep-pipeline.util';
import { waitForPortalBookingSelectionUi } from './wait-for-portal-booking-selection-ui.util';
import { waitForPortalManageApplicantsPage } from './wait-for-portal-manage-applicants-page.util';

const logger = new Logger('runPortalBookingContinuePipeline');

/**
 * Map detected Premium/payment surface → classifier (CON-004 / DEC-001 /
 * VT-TASK-010 finalize; Submit not in unsafe set).
 */
const forbiddenSurfaceFromClassifier = (
  surface: PortalBookingPremiumOrPaymentSurface,
): { errorCode: string; errorMessage: string } => {
  const classified = classifyPortalBookingUnsafeAction(surface);
  return {
    errorCode: classified.errorCode,
    errorMessage: classified.errorMessage,
  };
};

const acceptBookingAttentionIfShown = async (
  page: PortalPage,
  notes: string[],
  logPrefix: string,
  onCheckpoint?: RunPortalBookingContinuePipelineOptions['onCheckpoint'],
): Promise<{ ok: true } | { ok: false; error: string }> => {
  const attention = await acceptPortalAttentionModal(page);
  if (!attention.ok) {
    logger.error(`${logPrefix} phase=attention failure ${attention.error}`);
    return { ok: false, error: attention.error };
  }
  if (attention.accepted) {
    notes.push(`attention accepted via=${attention.via ?? 'Accept'}`);
    if (onCheckpoint) {
      await onCheckpoint({
        lastCompletedStep: PORTAL_BOOKING_CHECKPOINT_STEP.ATTENTION_ACCEPTED,
      });
    }
  } else {
    notes.push('attention modal not presented');
  }
  return { ok: true };
};

const persistPrefillCheckpoint = async (
  onCheckpoint: RunPortalBookingContinuePipelineOptions['onCheckpoint'],
  prefill: PortalBookingPrefillOutcome | undefined,
): Promise<void> => {
  if (!onCheckpoint || !prefill) {
    return;
  }
  await onCheckpoint({
    lastCompletedStep: PORTAL_BOOKING_CHECKPOINT_STEP.FORM_FILLED,
    bookingFieldProgress: prefill.fieldProgress,
  });
};

/**
 * After form ready: hard-stop on Premium/payment; ambiguous → staff mid-booking
 * (NOT_SAFE, not BOOK terminal); otherwise Submit → captcha → slots branch or
 * UNKNOWN_NEXT staff terminal (REQ-012…017 / DEC-001 / DEC-004 / DEC-008 /
 * OQ-007 / VT-TASK-007…010).
 */
const submitVisaTypeAfterFormReady = async (
  page: PortalPage,
  notes: string[],
  logPrefix: string,
  prefill: PortalBookingPrefillOutcome | undefined,
  options: Pick<
    RunPortalBookingContinuePipelineOptions,
    | 'onCheckpoint'
    | 'captchaServiceApiKey'
    | 'captchaProvider'
    | 'abortSignal'
  >,
): Promise<RunPortalBookingContinuePipelineResult> => {
  const onCheckpoint = options.onCheckpoint;

  if (prefill?.premiumRequiredStaffStop === true) {
    notes.push('prefill_premium_required_staff_takeover');
    const unsafe = forbiddenSurfaceFromClassifier('premium_lounge_accept');
    logger.warn(`${logPrefix} phase=submit blocked premium_crm`);
    return {
      ok: false,
      bookingSelectionUiOpen: true,
      prefill,
      notSafeToRepeat: true,
      error: unsafe.errorMessage,
      errorCode: unsafe.errorCode,
      notes,
    };
  }

  // DEC-004: open-UI + ambiguous is mid-booking staff gate — not BOOK success.
  if (prefill?.ambiguous === true) {
    notes.push('prefill_ambiguous_staff_takeover_skip_submit');
    logger.warn(`${logPrefix} phase=submit skipped ambiguous staff_gate`);
    return {
      ok: false,
      bookingSelectionUiOpen: true,
      prefill,
      notSafeToRepeat: true,
      error:
        'REQ-020: ambiguous CRM→portal booking prefill — staff gate (no guess; not open-UI BOOK terminal)',
      errorCode: 'bls_booking_ambiguous_prefill',
      notes,
    };
  }

  const forbiddenSurface =
    await isPortalBookingPremiumOrPaymentSurfaceVisible(page);
  if (forbiddenSurface !== null) {
    const unsafe = forbiddenSurfaceFromClassifier(forbiddenSurface);
    notes.push(`forbidden_surface_detected=${forbiddenSurface}`);
    logger.warn(
      `${logPrefix} phase=submit blocked surface=${forbiddenSurface}`,
    );
    if (onCheckpoint) {
      await onCheckpoint({
        lastCompletedStep:
          PORTAL_BOOKING_CHECKPOINT_STEP.PREMIUM_OR_PAYMENT_STOP,
        lastOutcome: PORTAL_BOOKING_CHECKPOINT_OUTCOME.PREMIUM_STOP,
        stuckCode: PORTAL_BOOKING_CHECKPOINT_STUCK_CODE.BOOK_PREMIUM_OR_PAYMENT,
      });
    }
    return {
      ok: false,
      bookingSelectionUiOpen: true,
      prefill,
      notSafeToRepeat: true,
      error: unsafe.errorMessage,
      errorCode: unsafe.errorCode,
      notes,
    };
  }

  logger.log(`${logPrefix} phase=submit start`);
  const submitted = await clickPortalVisaTypeSubmit(page);
  if (!submitted.ok) {
    logger.error(`${logPrefix} phase=submit failure ${submitted.error}`);
    return {
      ok: false,
      bookingSelectionUiOpen: true,
      prefill,
      error: submitted.error,
      notes,
    };
  }
  notes.push(`visa_type_submit via=${submitted.via}`);
  if (onCheckpoint) {
    await onCheckpoint({
      lastCompletedStep: PORTAL_BOOKING_CHECKPOINT_STEP.SUBMITTED,
    });
  }
  logger.log(`${logPrefix} phase=submit success`);

  const captcha = await runPortalBookingCaptchaPhase({
    page,
    captchaServiceApiKey: options.captchaServiceApiKey,
    captchaProvider: options.captchaProvider,
    onCheckpoint,
    logPrefix,
    abortSignal: options.abortSignal,
  });
  notes.push(...captcha.notes);
  if (!captcha.ok) {
    return {
      ok: false,
      bookingSelectionUiOpen: true,
      visaTypeSubmitted: true,
      captchaPresent: captcha.captchaPresent,
      captchaOk: captcha.captchaOk,
      prefill,
      error: captcha.error,
      ...(captcha.errorCode ? { errorCode: captcha.errorCode } : {}),
      notes,
    };
  }

  const slots = await runPortalBookingSlotsUnavailablePhase({
    page,
    onCheckpoint,
    logPrefix,
  });
  notes.push(...slots.notes);
  if (slots.slotsUnavailable) {
    // SAFE_TO_REPEAT mid-booking — no terminal cleanup / no AWAITING_STAFF_BOOKING.
    return {
      ok: false,
      bookingSelectionUiOpen: slots.tryAgainOk === true,
      visaTypeSubmitted: true,
      captchaPresent: captcha.captchaPresent,
      captchaOk: captcha.captchaOk,
      slotsUnavailable: true,
      prefill,
      error: slots.error,
      ...(slots.errorCode ? { errorCode: slots.errorCode } : {}),
      notes,
    };
  }

  // DEC-004 / OQ-007: materials-covered, slots absent → UNKNOWN_NEXT staff terminal.
  // Do not invent calendar success (REQ-017). Mailbox cleanup only after true terminal.
  notes.push('booking_unknown_next_staff_terminal');
  logger.log(
    `${logPrefix} phase=unknown_next staff_terminal AWAITING_STAFF_BOOKING`,
  );
  if (onCheckpoint) {
    await onCheckpoint({
      lastCompletedStep: PORTAL_BOOKING_CHECKPOINT_STEP.UNKNOWN_NEXT,
      lastOutcome: PORTAL_BOOKING_CHECKPOINT_OUTCOME.UNKNOWN_NEXT,
      stuckCode: PORTAL_BOOKING_CHECKPOINT_STUCK_CODE.BOOK_UNKNOWN_NEXT,
    });
  }

  return {
    ok: true,
    bookingSelectionUiOpen: false,
    visaTypeSubmitted: true,
    captchaPresent: captcha.captchaPresent,
    captchaOk: captcha.captchaOk,
    slotsUnavailable: false,
    unknownNext: true,
    prefill,
    notes,
  };
};

/**
 * Login → email DP consent → Manage Applicants → Book New Appointment →
 * Attention → extended prefill → VisaType Submit → captcha → slots or
 * UNKNOWN_NEXT staff terminal (DEC-001 / DEC-004 / DEC-008 / CON-005 /
 * OQ-007 / REQ-013…017 / VT-TASK-007…010).
 * Evolved from `runPortalBookingSafeStopPipeline`.
 *
 * Premium Lounge Accept / payment remain forbidden (CON-004).
 * BOOK success is materials-covered unknown-next — not open-UI-only (DEC-004).
 * Slots SAFE_TO_REPEAT does not schedule terminal mailbox cleanup.
 */
export const runPortalBookingContinuePipeline = async (
  options: RunPortalBookingContinuePipelineOptions,
): Promise<RunPortalBookingContinuePipelineResult> => {
  const logPrefix = options.logPrefix ?? 'portal-booking-continue';
  const notes: string[] = [];

  const login = await runPortalLoginPrepPipeline({
    page: options.page,
    portalFormEmail: options.portalFormEmail,
    captchaServiceApiKey: options.captchaServiceApiKey,
    captchaProvider: options.captchaProvider,
    logPrefix: `${logPrefix}/login`,
    submitPassword: true,
    portalPassword: options.portalPassword,
    abortSignal: options.abortSignal,
  });
  notes.push(...login.notes);

  if (!login.ok || login.loginAuthenticatedVerified !== true) {
    const error =
      login.error?.slice(0, 500) ?? 'login before booking continue failed';
    logger.error(`${logPrefix} phase=login failure ${error}`);
    return {
      ok: false,
      error,
      ...(login.errorCode ? { errorCode: login.errorCode } : {}),
      notes,
    };
  }

  notes.push('authenticated landing before booking continue');
  logger.log(`${logPrefix} phase=login success`);

  // SE-T06: ensure authenticated home before Manage Applicants / booking entry.
  logger.log(`${logPrefix} phase=ensure_home start`);
  const home = await ensurePortalAuthenticatedHome(options.page, {
    homeUrl: options.homeUrl,
  });
  notes.push(...home.notes);
  if (!home.ok) {
    logger.error(
      `${logPrefix} phase=ensure_home failure code=${home.errorCode} ${home.error}`,
    );
    return {
      ok: false,
      error: home.error,
      errorCode: home.errorCode,
      notes,
    };
  }
  notes.push('authenticated home recognized before booking continue');
  logger.log(`${logPrefix} phase=ensure_home success`);

  // DEC-002 / OQ-001: email DP consent mandatory before Book (skip if done).
  const alreadyConsented =
    options.priorCheckpoint?.dataProtectionConsentDone === true ||
    options.priorCheckpoint?.lastCompletedStep ===
      PORTAL_BOOKING_CHECKPOINT_STEP.EMAIL_CONSENT_DONE;
  if (!alreadyConsented) {
    if (!options.mailProvider || !options.mailbox) {
      const error =
        'retained mailbox provider required for data-protection consent';
      logger.error(`${logPrefix} phase=email_consent failure ${error}`);
      return { ok: false, error, notes };
    }
    const consent = await completePortalBookingEmailConsent({
      page: options.page,
      mailProvider: options.mailProvider,
      mailbox: options.mailbox,
      alreadyConsented: false,
      onCheckpoint: options.onCheckpoint,
      logPrefix,
      abortSignal: options.abortSignal,
    });
    notes.push(...consent.notes);
    if (!consent.ok) {
      return {
        ok: false,
        error: consent.error,
        ...(consent.errorCode ? { errorCode: consent.errorCode } : {}),
        notes,
      };
    }
  } else {
    notes.push('email_consent_skipped_already_done');
    logger.log(`${logPrefix} phase=email_consent skipped already_done`);
  }

  try {
    await options.page.goto(options.manageApplicantsUrl, {
      waitUntil: 'domcontentloaded',
      timeout: PORTAL_NAV_TIMEOUT_MS,
    });
  } catch (err) {
    const error = `manage applicants navigation failed: ${
      err instanceof Error ? err.message : String(err)
    }`;
    logger.error(`${logPrefix} phase=navigate failure ${error}`);
    return { ok: false, error, notes };
  }
  notes.push('navigated to Manage Applicants');

  const pageReady = await waitForPortalManageApplicantsPage(options.page);
  if (!pageReady.ok) {
    logger.error(`${logPrefix} phase=page_ready failure ${pageReady.error}`);
    return { ok: false, error: pageReady.error, notes };
  }

  // Already on booking UI (resume / deep link) — do not re-submit Book entry.
  if (await isPortalBookingSelectionUiVisible(options.page)) {
    notes.push('booking_selection_ui_already_open');
    if (options.onCheckpoint) {
      await options.onCheckpoint({
        lastCompletedStep: PORTAL_BOOKING_CHECKPOINT_STEP.BOOKING_UI_OPEN,
      });
    }
    const attention = await acceptBookingAttentionIfShown(
      options.page,
      notes,
      logPrefix,
      options.onCheckpoint,
    );
    if (!attention.ok) {
      return { ok: false, error: attention.error, notes };
    }
    const prefill = options.prefill
      ? await prefillPortalBookingSelectionFields(options.page, options.prefill)
      : undefined;
    if (prefill) {
      notes.push(...prefill.notes);
      await persistPrefillCheckpoint(options.onCheckpoint, prefill);
    }
    return submitVisaTypeAfterFormReady(
      options.page,
      notes,
      logPrefix,
      prefill,
      options,
    );
  }

  // CON-006 / MA-TASK-006: require READY_TO_BOOK before clicking Book.
  const readyForBook = await assertPortalManageApplicantsReadyForBook(
    options.page,
  );
  notes.push(...readyForBook.notes);
  if (!readyForBook.ok) {
    logger.error(
      `${logPrefix} phase=book_ready_gate failure ${readyForBook.error}`,
    );
    return { ok: false, error: readyForBook.error, notes };
  }
  notes.push(`book_ready_gate_ok readyCount=${readyForBook.readyCount}`);

  const clicked = await clickPortalBookNewAppointment(options.page);
  if (!clicked.ok) {
    logger.error(`${logPrefix} phase=book_link failure ${clicked.error}`);
    return { ok: false, error: clicked.error, notes };
  }
  notes.push('clicked Book New Appointment');

  const bookingReady = await waitForPortalBookingSelectionUi(options.page);
  if (!bookingReady.ok) {
    logger.error(
      `${logPrefix} phase=booking_ui failure ${bookingReady.error}`,
    );
    return { ok: false, error: bookingReady.error, notes };
  }
  notes.push('booking_selection_ui_open');
  if (options.onCheckpoint) {
    await options.onCheckpoint({
      lastCompletedStep: PORTAL_BOOKING_CHECKPOINT_STEP.BOOKING_UI_OPEN,
    });
  }

  const attention = await acceptBookingAttentionIfShown(
    options.page,
    notes,
    logPrefix,
    options.onCheckpoint,
  );
  if (!attention.ok) {
    return { ok: false, error: attention.error, notes };
  }

  const prefill = options.prefill
    ? await prefillPortalBookingSelectionFields(options.page, options.prefill)
    : undefined;
  if (prefill) {
    notes.push(...prefill.notes);
    await persistPrefillCheckpoint(options.onCheckpoint, prefill);
  }

  return submitVisaTypeAfterFormReady(
    options.page,
    notes,
    logPrefix,
    prefill,
    options,
  );
};
