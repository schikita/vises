import { Logger } from '@nestjs/common';
import { PORTAL_NAV_TIMEOUT_MS } from '../constants';
import type {
  RunPortalBookingSafeStopPipelineOptions,
  RunPortalBookingSafeStopPipelineResult,
} from '../types';
import { clickPortalBookNewAppointment } from './click-portal-book-new-appointment.util';
import { isPortalBookingSelectionUiVisible } from './is-portal-booking-selection-ui-visible.util';
import { prefillPortalBookingSelectionFields } from './prefill-portal-booking-selection-fields.util';
import { runPortalLoginPrepPipeline } from './run-portal-login-prep-pipeline.util';
import { waitForPortalBookingSelectionUi } from './wait-for-portal-booking-selection-ui.util';
import { waitForPortalManageApplicantsPage } from './wait-for-portal-manage-applicants-page.util';

const logger = new Logger('runPortalBookingSafeStopPipeline');

/**
 * Login → Manage Applicants → open Book New Appointment → optional unambiguous
 * prefill → **stop** before VisaType `#btnSubmit` / Premium Lounge / payment
 * (REQ-020 / REQ-030 / CON-006 / DEC-011).
 */
export const runPortalBookingSafeStopPipeline = async (
  options: RunPortalBookingSafeStopPipelineOptions,
): Promise<RunPortalBookingSafeStopPipelineResult> => {
  const logPrefix = options.logPrefix ?? 'portal-booking-safe-stop';
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
      login.error?.slice(0, 500) ?? 'login before booking safe-stop failed';
    logger.error(`${logPrefix} phase=login failure ${error}`);
    return {
      ok: false,
      error,
      ...(login.errorCode ? { errorCode: login.errorCode } : {}),
      notes,
    };
  }

  notes.push('authenticated landing before booking safe-stop');
  logger.log(`${logPrefix} phase=login success`);

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

  // Already on booking UI (resume / deep link) — do not re-submit anything.
  if (await isPortalBookingSelectionUiVisible(options.page)) {
    notes.push('booking_selection_ui_already_open');
    const prefill = options.prefill
      ? await prefillPortalBookingSelectionFields(options.page, options.prefill)
      : undefined;
    if (prefill) {
      notes.push(...prefill.notes);
    }
    logger.log(`${logPrefix} phase=safe_stop success already_open`);
    return {
      ok: true,
      bookingSelectionUiOpen: true,
      prefill,
      notes,
    };
  }

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

  const prefill = options.prefill
    ? await prefillPortalBookingSelectionFields(options.page, options.prefill)
    : undefined;
  if (prefill) {
    notes.push(...prefill.notes);
    if (prefill.ambiguous) {
      notes.push('prefill_ambiguous_staff_takeover');
    }
  }

  // CON-006: never click #btnSubmit / OnSubmitVisaType / Premium Lounge Accept.
  // Safe stop reached — staff takes over (AWAITING_STAFF_BOOKING via orchestrator).
  logger.log(`${logPrefix} phase=safe_stop success`);
  return {
    ok: true,
    bookingSelectionUiOpen: true,
    prefill,
    notes,
  };
};
